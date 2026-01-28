import React, { useEffect, useState } from 'react'
import { View, FlatList, StyleSheet, Dimensions } from 'react-native'
import { Text, Card, ActivityIndicator, Surface } from 'react-native-paper'
import { useAuth } from '../../contexts/AuthContext'
import { getFastingHistory, getFastingStats } from '../../services/fasting'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { theme } from '../../utils/theme'
import Svg, { Rect, Text as SvgText } from 'react-native-svg'

const Chart = ({ data }) => {
    // Simple bar chart of last 7 fasts durations
    const width = Dimensions.get('window').width - 70 // Adjust for padding
    const height = 150
    const barWidth = 20
    const spacing = 15

    if (!data || data.length === 0) return null

    // Take last 7, reverse to show chronological left to right
    const chartData = [...data].slice(0, 7).reverse()

    const maxDuration = Math.max(...chartData.map(d => d.duration_hours || 0), 1)

    return (
        <Surface style={styles.chartContainer}>
            <Text variant="titleMedium" style={{marginBottom: 10}}>Progression (Derniers 7 jeûnes)</Text>
            <Svg width={width} height={height}>
                {chartData.map((d, index) => {
                    const h = (d.duration_hours / maxDuration) * (height - 30)
                    const x = index * (barWidth + spacing) + 10
                    const y = height - h - 20
                    return (
                        <React.Fragment key={d.id}>
                            <Rect
                                x={x}
                                y={y}
                                width={barWidth}
                                height={h}
                                fill={d.status === 'completed' ? theme.colors.success : theme.colors.warning}
                                rx={4}
                            />
                            <SvgText
                                x={x + barWidth/2}
                                y={height}
                                fontSize="10"
                                textAnchor="middle"
                                fill={theme.colors.textSecondary}
                            >
                                {d.duration_hours ? d.duration_hours.toFixed(1) : '0'}
                            </SvgText>
                        </React.Fragment>
                    )
                })}
            </Svg>
        </Surface>
    )
}

export default function FastingHistoryScreen() {
    const { user } = useAuth()
    const [history, setHistory] = useState([])
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        if (!user) return
        setLoading(true)
        const [historyRes, statsRes] = await Promise.all([
            getFastingHistory(user.id, 20),
            getFastingStats(user.id)
        ])

        if (historyRes.data) setHistory(historyRes.data)
        if (statsRes.data) setStats(statsRes.data)
        setLoading(false)
    }

    const renderItem = ({ item }) => (
        <Card style={styles.card}>
            <Card.Content style={styles.cardContent}>
                <View>
                    <Text variant="titleMedium">{format(new Date(item.start_time), 'EEE d MMM', { locale: fr })}</Text>
                    <Text variant="bodySmall" style={{color: theme.colors.textSecondary}}>
                        {format(new Date(item.start_time), 'HH:mm')} - {item.end_time ? format(new Date(item.end_time), 'HH:mm') : '?'}
                    </Text>
                </View>
                <View style={{alignItems: 'flex-end'}}>
                    <Text variant="titleLarge" style={{color: item.status === 'completed' ? theme.colors.success : theme.colors.warning}}>
                        {item.duration_hours ? item.duration_hours.toFixed(1) : '0'}h
                    </Text>
                    <Text variant="labelSmall">/{item.target_hours}h</Text>
                </View>
            </Card.Content>
        </Card>
    )

    const renderHeader = () => (
        <View>
            {stats && (
                <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                        <Text variant="displaySmall" style={{color: theme.colors.primary}}>{stats.totalFasts}</Text>
                        <Text variant="labelSmall">Total</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text variant="displaySmall" style={{color: theme.colors.secondary}}>{stats.averageDuration.toFixed(1)}h</Text>
                        <Text variant="labelSmall">Moyenne</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text variant="displaySmall" style={{color: theme.colors.premium}}>{stats.longestFast.toFixed(1)}h</Text>
                        <Text variant="labelSmall">Record</Text>
                    </View>
                </View>
            )}
            <Chart data={history} />
            <Text variant="titleMedium" style={styles.listTitle}>Historique récent</Text>
        </View>
    )

    if (loading) {
        return <View style={styles.centered}><ActivityIndicator /></View>
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={history}
                renderItem={renderItem}
                keyExtractor={item => item.id.toString()}
                contentContainerStyle={styles.list}
                ListHeaderComponent={renderHeader}
                ListEmptyComponent={<Text style={{textAlign: 'center', marginTop: 20}}>Aucun jeûne enregistré.</Text>}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    list: {
        padding: 20,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
        backgroundColor: theme.colors.surface,
        padding: 15,
        borderRadius: theme.borderRadius.lg,
        elevation: 2,
    },
    statItem: {
        alignItems: 'center',
    },
    chartContainer: {
        padding: 15,
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.lg,
        marginBottom: 20,
        elevation: 2,
    },
    listTitle: {
        marginBottom: 10,
        fontWeight: 'bold',
    },
    card: {
        marginBottom: 10,
        backgroundColor: theme.colors.surface,
    },
    cardContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
})
