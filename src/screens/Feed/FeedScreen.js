import React from 'react'
import { View, FlatList, Text } from 'react-native'

export default function FeedScreen() {
  // Placeholder data
  const posts = []

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={posts}
        renderItem={({ item }) => (
          <View style={{ padding: 20, borderBottomWidth: 1 }}>
            <Text>{item.title}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={{ padding: 20, textAlign: 'center' }}>Aucun post</Text>}
      />
    </View>
  )
}
