"use client"

import { useState, useEffect } from "react"
import { View, Text, TouchableOpacity, StyleSheet } from "react-native"
import { StorageService, type User } from "@/services/storage"
import UsersAdmin from "@/components/admin/UsersAdmin"
import ProductsAdmin from "@/components/admin/ProductsAdmin"
import OrdersAdmin from "@/components/admin/OrdersAdmin"

type AdminSection = "users" | "products" | "orders"

export default function AdminScreen() {
  const [activeSection, setActiveSection] = useState<AdminSection>("users")
  const [currentUser, setCurrentUser] = useState<User | null>(null)

  useEffect(() => {
    checkCurrentUser()
  }, [])

  const checkCurrentUser = async () => {
    const user = await StorageService.getCurrentUser()
    setCurrentUser(user)
  }

  if (currentUser?.role !== "admin") {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Panel de Administración</Text>
        <View style={styles.accessDenied}>
          <Text style={styles.accessDeniedText}>Solo los administradores pueden acceder a esta sección</Text>
        </View>
      </View>
    )
  }

  const renderContent = () => {
    switch (activeSection) {
      case "users":
        return <UsersAdmin />
      case "products":
        return <ProductsAdmin />
      case "orders":
        return <OrdersAdmin />
      default:
        return <UsersAdmin />
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Panel de Administración</Text>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeSection === "users" && styles.activeTab]}
          onPress={() => setActiveSection("users")}
        >
          <Text style={[styles.tabText, activeSection === "users" && styles.activeTabText]}>Usuarios</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeSection === "products" && styles.activeTab]}
          onPress={() => setActiveSection("products")}
        >
          <Text style={[styles.tabText, activeSection === "products" && styles.activeTabText]}>Productos</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeSection === "orders" && styles.activeTab]}
          onPress={() => setActiveSection("orders")}
        >
          <Text style={[styles.tabText, activeSection === "orders" && styles.activeTabText]}>Pedidos</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>{renderContent()}</View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    paddingTop: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#333",
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "white",
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: "#2196F3",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  activeTabText: {
    color: "white",
  },
  content: {
    flex: 1,
  },
  accessDenied: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  accessDeniedText: {
    fontSize: 18,
    color: "#f44336",
    textAlign: "center",
  },
})
