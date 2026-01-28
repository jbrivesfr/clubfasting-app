import React, { useState, useEffect, useRef } from 'react'
import { View, StyleSheet, ScrollView, Alert } from 'react-native'
import { Text, Button, IconButton, SegmentedButtons } from 'react-native-paper'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useAuth } from '../../contexts/AuthContext'
import { startFast, stopFast, completeFast, getActiveFast } from '../../services/fasting'
import { differenceInSeconds, differenceInHours, format } from 'date-fns'
import { theme } from '../../utils/theme'
import Svg, { Circle } from 'react-native-svg';

// Circular Progress Component
const CircularProgress = ({ size, strokeWidth, progress, color, children }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - progress * circumference;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Circle
          stroke="#e6e6e6"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <Circle
          stroke={color}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
          fill="transparent"
        />
      </Svg>
      <View style={{ ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', position: 'absolute' }}>
        {children}
      </View>
    </View>
  );
};


export default function FastingScreen({ navigation }) {
  const { user } = useAuth()
  const [activeFast, setActiveFast] = useState(null) // { id, start_time, target_hours }
  const [elapsed, setElapsed] = useState(0)
  const [targetHours, setTargetHours] = useState('16')
  const [loading, setLoading] = useState(true)

  const timerRef = useRef(null)

  // Load active fast on mount
  useEffect(() => {
    loadActiveFast()
  }, [])

  // Timer logic
  useEffect(() => {
    if (activeFast) {
      const interval = setInterval(() => {
        const now = new Date()
        const start = new Date(activeFast.start_time)
        const diff = differenceInSeconds(now, start)
        setElapsed(diff >= 0 ? diff : 0)
      }, 1000)
      return () => clearInterval(interval)
    } else {
      setElapsed(0)
    }
  }, [activeFast])

  const loadActiveFast = async () => {
    setLoading(true)
    try {
      // Try AsyncStorage first for speed
      const savedFast = await AsyncStorage.getItem('activeFast')
      if (savedFast) {
        const parsed = JSON.parse(savedFast)
        setActiveFast(parsed)
        // Set initial elapsed
        const now = new Date()
        const start = new Date(parsed.start_time)
        setElapsed(differenceInSeconds(now, start))
      }

      // Then sync with DB
      if (user) {
        const { data, error } = await getActiveFast(user.id)
        if (data) {
          setActiveFast(data)
          AsyncStorage.setItem('activeFast', JSON.stringify(data))
          setTargetHours(data.target_hours.toString())
        } else {
            // If DB says no fast, but we have one locally?
            if (!data && savedFast) {
                // Check if user matches? Assumed same user.
                setActiveFast(null)
                AsyncStorage.removeItem('activeFast')
            }
        }
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleStart = async () => {
    if (!user) return
    setLoading(true)
    try {
      const { data, error } = await startFast(user.id, parseInt(targetHours))
      if (error) throw error

      setActiveFast(data)
      AsyncStorage.setItem('activeFast', JSON.stringify(data))
    } catch (e) {
      Alert.alert('Error', e.message)
    } finally {
      setLoading(false)
    }
  }

  const handleStop = async () => {
    if (!activeFast) return

    // Check if completed
    const targetSeconds = parseInt(activeFast.target_hours) * 3600
    const isCompleted = elapsed >= targetSeconds
    const durationHours = elapsed / 3600
    const endTime = new Date().toISOString()

    setLoading(true)
    try {
      if (isCompleted) {
        await completeFast(activeFast.id, endTime, durationHours)
        Alert.alert('Félicitations!', 'Jeûne terminé.')
      } else {
        await stopFast(activeFast.id, endTime, durationHours)
        Alert.alert('Jeûne arrêté', 'Vous ferez mieux la prochaine fois!')
      }

      setActiveFast(null)
      AsyncStorage.removeItem('activeFast')
    } catch (e) {
      Alert.alert('Error', e.message)
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (seconds) => {
    if (seconds < 0) seconds = 0
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const progress = activeFast ? Math.min(elapsed / (parseInt(activeFast.target_hours) * 3600), 1) : 0

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>

        {!activeFast ? (
            <View style={styles.setupContainer}>
                <Text variant="headlineMedium" style={styles.header}>Prêt à jeûner ?</Text>
                <Text variant="bodyLarge" style={styles.subHeader}>Choisissez votre objectif</Text>

                <SegmentedButtons
                    value={targetHours}
                    onValueChange={setTargetHours}
                    buttons={[
                    { value: '16', label: '16h' },
                    { value: '18', label: '18h' },
                    { value: '20', label: '20h' },
                    { value: '24', label: '24h' },
                    ]}
                    style={styles.segment}
                />

                <View style={styles.circleContainer}>
                    <CircularProgress size={250} strokeWidth={15} progress={0} color={theme.colors.primary}>
                         <IconButton icon="play" size={60} iconColor={theme.colors.primary} onPress={handleStart} />
                         <Text variant="titleMedium">Commencer</Text>
                    </CircularProgress>
                </View>
            </View>
        ) : (
            <View style={styles.activeContainer}>
                <Text variant="titleLarge" style={styles.statusText}>
                    Jeûne en cours ({activeFast.target_hours}h)
                </Text>

                <View style={styles.circleContainer}>
                    <CircularProgress size={280} strokeWidth={20} progress={progress} color={theme.colors.primary}>
                        <Text variant="displayLarge" style={styles.timerText}>{formatTime(elapsed)}</Text>
                        <Text variant="bodyMedium" style={{color: theme.colors.textSecondary}}>
                            {Math.round(progress * 100)}%
                        </Text>
                    </CircularProgress>
                </View>

                <View style={styles.infoRow}>
                    <View style={styles.infoItem}>
                        <Text variant="labelMedium">Début</Text>
                        <Text variant="bodyLarge">{format(new Date(activeFast.start_time), 'HH:mm')}</Text>
                    </View>
                     <View style={styles.infoItem}>
                        <Text variant="labelMedium">Fin prévue</Text>
                        <Text variant="bodyLarge">
                            {format(new Date(new Date(activeFast.start_time).getTime() + activeFast.target_hours * 3600000), 'HH:mm')}
                        </Text>
                    </View>
                </View>

                <Button
                    mode="contained"
                    onPress={handleStop}
                    style={styles.stopButton}
                    buttonColor={progress >= 1 ? theme.colors.success : theme.colors.error}
                    loading={loading}
                >
                    {progress >= 1 ? 'Terminer le jeûne' : 'Arrêter le jeûne'}
                </Button>
            </View>
        )}

        <Button mode="outlined" onPress={() => navigation.navigate('FastingHistory')} style={styles.historyButton}>
            Voir l'historique
        </Button>

      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: 20,
    alignItems: 'center',
    flexGrow: 1,
  },
  setupContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 40,
  },
  activeContainer: {
     width: '100%',
    alignItems: 'center',
    marginTop: 20,
  },
  header: {
    marginBottom: 10,
    fontWeight: 'bold',
  },
  subHeader: {
    marginBottom: 30,
    color: theme.colors.textSecondary,
  },
  segment: {
    marginBottom: 50,
    width: '100%',
  },
  circleContainer: {
    marginBottom: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerText: {
    fontVariant: ['tabular-nums'],
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  statusText: {
      marginBottom: 30,
      fontWeight: '600',
  },
  stopButton: {
      width: '80%',
      paddingVertical: 5,
  },
  historyButton: {
      marginTop: 'auto',
      marginBottom: 20,
      width: '100%',
  },
  infoRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      width: '100%',
      marginBottom: 40,
  },
  infoItem: {
      alignItems: 'center',
  }
})
