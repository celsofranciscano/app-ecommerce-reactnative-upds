"use client"

import { useState, useEffect } from "react"
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from "react-native"
import { StorageService, type Order, type User, type Product } from "@/services/storage"

interface OrderWithDetails extends Order {
  user?: User
  itemsWithProducts: Array<{
    productId: string
    quantity: number
    product?: Product
  }>
}

export default function OrdersAdmin() {
  const [orders, setOrders] = useState<OrderWithDetails[]>([])

  useEffect(() => {
    loadOrders()
  }, [])

  const loadOrders = async () => {
    const ordersData = await StorageService.getOrders()
    const users = await StorageService.getUsers()
    const products = await StorageService.getProducts()

    const ordersWithDetails: OrderWithDetails[] = ordersData.map((order) => {
      const user = users.find((u) => u.id === order.userId)
      const itemsWithProducts = order.items.map((item) => ({
        ...item,
        product: products.find((p) => p.id === item.productId),
      }))

      return {
        ...order,
        user,
        itemsWithProducts,
      }
    })

    // Ordenar por fecha más reciente
    ordersWithDetails.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    setOrders(ordersWithDetails)
  }

  const updateOrderStatus = async (orderId: string, newStatus: Order["status"]) => {
    try {
      await StorageService.updateOrder(orderId, { status: newStatus })
      loadOrders()
      Alert.alert("Éxito", "Estado del pedido actualizado")
    } catch (error) {
      Alert.alert("Error", "No se pudo actualizar el estado")
    }
  }

  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return "#FF9800"
      case "confirmed":
        return "#2196F3"
      case "delivered":
        return "#4CAF50"
      default:
        return "#666"
    }
  }

  const getStatusText = (status: Order["status"]) => {
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

  const renderOrder = ({ item }: { item: OrderWithDetails }) => (
    <View style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <Text style={styles.orderId}>Pedido #{item.id}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
        </View>
      </View>

      <View style={styles.orderInfo}>
        <Text style={styles.customerName}>Cliente: {item.user?.name || "Usuario no encontrado"}</Text>
        <Text style={styles.customerEmail}>Email: {item.user?.email || "N/A"}</Text>
        <Text style={styles.orderDate}>
          Fecha: {new Date(item.createdAt).toLocaleDateString()} {new Date(item.createdAt).toLocaleTimeString()}
        </Text>
        <Text style={styles.orderTotal}>Total: Bs. {item.total.toLocaleString()}</Text>
      </View>

      <View style={styles.orderItems}>
        <Text style={styles.itemsTitle}>Productos:</Text>
        {item.itemsWithProducts.map((orderItem, index) => (
          <View key={index} style={styles.orderItem}>
            <Text style={styles.itemName}>{orderItem.product?.name || "Producto no encontrado"}</Text>
            <Text style={styles.itemDetails}>
              Cantidad: {orderItem.quantity} × Bs. {orderItem.product?.price?.toLocaleString() || 0}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.orderActions}>
        {item.status === "pending" && (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: "#2196F3" }]}
            onPress={() => updateOrderStatus(item.id, "confirmed")}
          >
            <Text style={styles.actionButtonText}>Confirmar</Text>
          </TouchableOpacity>
        )}
        {item.status === "confirmed" && (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: "#4CAF50" }]}
            onPress={() => updateOrderStatus(item.id, "delivered")}
          >
            <Text style={styles.actionButtonText}>Marcar Entregado</Text>
          </TouchableOpacity>
        )}
        {item.status !== "pending" && (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: "#FF9800" }]}
            onPress={() => updateOrderStatus(item.id, "pending")}
          >
            <Text style={styles.actionButtonText}>Marcar Pendiente</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  )

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Gestión de Pedidos</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={loadOrders}>
          <Text style={styles.refreshButtonText}>Actualizar</Text>
        </TouchableOpacity>
      </View>

      {orders.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No hay pedidos registrados</Text>
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
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  refreshButton: {
    backgroundColor: "#2196F3",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  refreshButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  listContainer: {
    paddingBottom: 20,
  },
  orderCard: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  orderId: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  orderInfo: {
    marginBottom: 12,
    gap: 4,
  },
  customerName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  customerEmail: {
    fontSize: 12,
    color: "#666",
  },
  orderDate: {
    fontSize: 12,
    color: "#666",
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2196F3",
  },
  orderItems: {
    marginBottom: 12,
  },
  itemsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  orderItem: {
    backgroundColor: "#f5f5f5",
    padding: 8,
    borderRadius: 4,
    marginBottom: 4,
  },
  itemName: {
    fontSize: 13,
    fontWeight: "600",
    color: "#333",
  },
  itemDetails: {
    fontSize: 12,
    color: "#666",
  },
  orderActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    flex: 1,
    padding: 10,
    borderRadius: 6,
    alignItems: "center",
  },
  actionButtonText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyStateText: {
    fontSize: 16,
    color: "#666",
  },
})
