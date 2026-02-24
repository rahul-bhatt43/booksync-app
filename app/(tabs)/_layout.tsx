import MiniPlayer from '@/components/MiniPlayer';
import { useAudio } from '@/contexts/AudioContext';
import { Tabs } from 'expo-router';
import { Compass, Home, Library, User } from 'lucide-react-native';
import React from 'react';
import { Platform, View } from 'react-native';

export default function TabLayout() {
  const { currentTrack } = useAudio();

  return (
    <View className="flex-1">
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: '#09090b', // zinc-950
            borderTopWidth: 1,
            borderTopColor: '#27272a', // zinc-800
            height: Platform.OS === 'ios' ? 88 : 70,
            paddingBottom: Platform.OS === 'ios' ? 28 : 12,
            paddingTop: 12,
          },
          tabBarActiveTintColor: '#f59e0b', // amber-500
          tabBarInactiveTintColor: '#a1a1aa', // zinc-400
          tabBarLabelStyle: {
            fontFamily: 'Inter-Medium',
            fontSize: 12,
            marginTop: 4,
          },
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, focused }) => (
              <Home color={color} size={24} strokeWidth={focused ? 2.5 : 2} />
            ),
          }}
        />
        <Tabs.Screen
          name="explore"
          options={{
            title: 'Explore',
            tabBarIcon: ({ color, focused }) => (
              <Compass color={color} size={24} strokeWidth={focused ? 2.5 : 2} />
            ),
          }}
        />
        <Tabs.Screen
          name="library"
          options={{
            title: 'Library',
            tabBarIcon: ({ color, focused }) => (
              <Library color={color} size={24} strokeWidth={focused ? 2.5 : 2} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color, focused }) => (
              <User color={color} size={24} strokeWidth={focused ? 2.5 : 2} />
            ),
          }}
        />
      </Tabs>

      {/* Conditionally render MiniPlayer */}
      {currentTrack && <MiniPlayer />}
    </View>
  );
}
