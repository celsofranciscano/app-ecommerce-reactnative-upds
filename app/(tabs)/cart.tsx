"use client"

import { useState, useEffect } from "react"
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet, Alert } from "react-native"
import { StorageService, type CartItem, type Product, type User } from "@/services/storage"

interface CartItemWithProduct extends CartItem {
  product: Product
}

export default function CartScreen() {
  const [cartItems, setCartItems] = useState<CartItemWithProduct[]>([])
  const [total, setTotal] = useState(0)
  const [currentUser, setCurrentUser] = useState<User | null>(null)

  useEffect(() => {
    checkCurrentUser()
    loadCart()
  }, [])

  const checkCurrentUser = async () => {
    const user = await StorageService.getCurrentUser()
    setCurrentUser(user)
  }

  const loadCart = async () => {
    const cart = await StorageService.getCart()
    const products = await StorageService.getProducts()

    const cartWithProducts: CartItemWithProduct[] = cart
      .map((item) => {
        const product = products.find((p) => p.id === item.productId)
        return product ? { ...item, product } : null
      })
      .filter(Boolean) as CartItemWithProduct[]

    setCartItems(cartWithProducts)

    const totalAmount = cartWithProducts.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
    setTotal(totalAmount)
  }

  const removeFromCart = async (productId: string) => {
    Alert.alert("Confirmar", "¿Deseas eliminar este producto del carrito?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          await StorageService.removeFromCart(productId)
          loadCart()
        },
      },
    ])
  }

  const updateQuantity = async (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId)
      return
    }

    const success = await StorageService.updateCartItemQuantity(productId, newQuantity)
    if (success) {
      loadCart()
    } else {
      Alert.alert("Error", "No hay suficiente stock disponible")
    }
  }

  const confirmOrder = async () => {
    if (cartItems.length === 0) {
      Alert.alert("Carrito vacío", "Agrega productos antes de confirmar")
      return
    }

    const user = await StorageService.getCurrentUser()
    if (!user) {
      Alert.alert("Error", "Debes iniciar sesión para realizar un pedido")
      return
    }

    try {
      const order = {
        userId: user.id,
        items: cartItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        total,
        status: "pending" as const,
      }

      await StorageService.addOrder(order)
      await StorageService.clearCart()

      Alert.alert("Éxito", "Pedido confirmado correctamente", [{ text: "OK", onPress: () => loadCart() }])
    } catch (error) {
      Alert.alert("Error", "No se pudo confirmar el pedido")
    }
  }

  const renderCartItem = ({ item }: { item: CartItemWithProduct }) => (
    <View style={styles.cartItem}>
      <Image source={{ uri: item.product.image }} style={styles.itemImage} />
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.product.name}</Text>
        <Text style={styles.itemPrice}>Bs. {item.product.price.toLocaleString()}</Text>

        <View style={styles.quantityContainer}>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => updateQuantity(item.productId, item.quantity - 1)}
          >
            <Text style={styles.quantityButtonText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.itemQuantity}>{item.quantity}</Text>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => updateQuantity(item.productId, item.quantity + 1)}
          >
            <Text style={styles.quantityButtonText}>+</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.itemSubtotal}>Subtotal: Bs. {(item.product.price * item.quantity).toLocaleString()}</Text>
      </View>
      <TouchableOpacity style={styles.removeButton} onPress={() => removeFromCart(item.productId)}>
        <Text style={styles.removeButtonText}>Eliminar</Text>
      </TouchableOpacity>
    </View>
  )

  if (currentUser?.role !== "customer") {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Carrito de Compras</Text>
        <View style={styles.emptyCart}>
          <Text style={styles.emptyCartText}>Solo los clientes pueden acceder al carrito</Text>
        </View>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Carrito de Compras</Text>

      {cartItems.length === 0 ? (
        <View style={styles.emptyCart}>
          <Text style={styles.emptyCartText}>Tu carrito está vacío</Text>
        </View>
      ) : (
        <>
          <FlatList
            data={cartItems}
            renderItem={renderCartItem}
            keyExtractor={(item) => item.productId}
            contentContainerStyle={styles.listContainer}
          />

          <View style={styles.footer}>
            <Text style={styles.totalText}>Total: Bs. {total.toLocaleString()}</Text>
            <TouchableOpacity style={styles.confirmButton} onPress={confirmOrder}>
              <Text style={styles.confirmButtonText}>Confirmar Pedido</Text>
            </TouchableOpacity>
          </View>
        </>
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
  cartItem: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    flexDirection: "row",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
    gap: 4,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  itemPrice: {
    fontSize: 14,
    color: "#2196F3",
    fontWeight: "600",
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 4,
  },
  quantityButton: {
    backgroundColor: "#2196F3",
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  quantityButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  itemQuantity: {
    fontSize: 16,
    fontWeight: "bold",
    marginHorizontal: 16,
    minWidth: 30,
    textAlign: "center",
  },
  itemSubtotal: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  removeButton: {
    backgroundColor: "#f44336",
    padding: 8,
    borderRadius: 6,
    alignSelf: "center",
  },
  removeButtonText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  emptyCart: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyCartText: {
    fontSize: 18,
    color: "#666",
  },
  footer: {
    backgroundColor: "white",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  totalText: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
    color: "#333",
  },
  confirmButton: {
    backgroundColor: "#4CAF50",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  confirmButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
})
