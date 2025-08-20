"use client"

import { useState, useEffect } from "react"
import { View, Text, FlatList, StyleSheet } from "react-native"
import { StorageService, type Order, type User } from "@/services/storage"

export default function OrdersScreen() {
  const [orders, setOrders] = useState<Order[]>([])
  const [currentUser, setCurrentUser] = useState<User | null>(null)

  useEffect(() => {
    checkCurrentUser()
  }, [])

  useEffect(() => {
    if (currentUser) {
      loadOrders()
    }
  }, [currentUser])

  const checkCurrentUser = async () => {
    const user = await StorageService.getCurrentUser()
    setCurrentUser(user)
  }

  const loadOrders = async () => {
    if (!currentUser) return

    const allOrders = await StorageService.getOrders()
    const userOrders = allOrders.filter((order) => order.userId === currentUser.id)
    setOrders(userOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "#ff9800"
      case "confirmed":
        return "#2196F3"
      case "delivered":
        return "#4CAF50"
      default:
        return "#666"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Pendiente"
      case "confirmed":
        return "Confirmado"
      case "delivered":
        return "Entregado"
      default:
        return status
    }
  }

  const renderOrder = ({ item }: { item: Order }) => (
    <View style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <Text style={styles.orderId}>Pedido #{item.id}</Text>
        <Text style={[styles.orderStatus, { color: getStatusColor(item.status) }]}>{getStatusText(item.status)}</Text>
      </View>

      <Text style={styles.orderDate}>
        {new Date(item.createdAt).toLocaleDateString("es-ES", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}
      </Text>

      <Text style={styles.orderItems}>{item.items.length} producto(s)</Text>

      <Text style={styles.orderTotal}>Total: Bs. {item.total.toLocaleString()}</Text>
    </View>
  )

  if (currentUser?.role !== "customer") {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Mis Pedidos</Text>
        <View style={styles.emptyOrders}>
          <Text style={styles.emptyOrdersText}>Solo los clientes pueden ver sus pedidos</Text>
        </View>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mis Pedidos</Text>

      {orders.length === 0 ? (
        <View style={styles.emptyOrders}>
          <Text style={styles.emptyOrdersText}>No tienes pedidos aún</Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          renderItem={renderOrder}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
        />
      )}
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
  listContainer: {
    padding: 16,
  },
  orderCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  orderId: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  orderStatus: {
    fontSize: 14,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  orderDate: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  orderItems: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  orderTotal: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2196F3",
  },
  emptyOrders: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyOrdersText: {
    fontSize: 18,
    color: "#666",
  },
})
