"use client"

import { Tabs } from "expo-router"
import { Platform } from "react-native"
import { useEffect, useState } from "react"
import { StorageService, type User } from "@/services/storage"

import { HapticTab } from "@/components/HapticTab"
import { IconSymbol } from "@/components/ui/IconSymbol"
import TabBarBackground from "@/components/ui/TabBarBackground"
import { Colors } from "@/constants/Colors"
import { useColorScheme } from "@/hooks/useColorScheme"

export default function TabLayout() {
  const colorScheme = useColorScheme()
  const [currentUser, setCurrentUser] = useState<User | null>(null)

  useEffect(() => {
    checkCurrentUser()

    const handleUpdate = () => {
      checkCurrentUser()
    }

    StorageService.addListener(handleUpdate)

    return () => {
      StorageService.removeListener(handleUpdate)
    }
  }, [])

  const checkCurrentUser = async () => {
    const user = await StorageService.getCurrentUser()
    setCurrentUser(user)
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            position: "absolute",
          },
          default: {},
        }),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Tienda",
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="storefront.fill" color={color} />,
          href: currentUser?.role === "admin" ? null : "/",
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: "Carrito",
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="cart.fill" color={color} />,
          href: currentUser?.role === "customer" ? "/cart" : null,
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: "Mis Pedidos",
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="list.bullet" color={color} />,
          href: currentUser?.role === "customer" ? "/orders" : null,
        }}
      />
      <Tabs.Screen
        name="admin"
        options={{
          title: "Admin",
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="gear" color={color} />,
          href: currentUser?.role === "admin" ? "/admin" : null,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Perfil",
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.fill" color={color} />,
        }}
      />
    </Tabs>
  )
}
