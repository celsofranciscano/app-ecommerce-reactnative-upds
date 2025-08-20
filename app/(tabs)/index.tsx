"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  RefreshControl,
  TextInput,
  Modal,
} from "react-native"
import { StorageService, type Product, type User } from "@/services/storage"

export default function StoreScreen() {
  const [products, setProducts] = useState<Product[]>([])
  const [refreshing, setRefreshing] = useState(false)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [quantity, setQuantity] = useState("1")
  const [modalVisible, setModalVisible] = useState(false)

  useEffect(() => {
    initializeAndLoadData()
    checkCurrentUser()
  }, [])

  const initializeAndLoadData = async () => {
    await StorageService.initializeData()
    loadProducts()
  }

  const loadProducts = async () => {
    const productsData = await StorageService.getProducts()
    setProducts(productsData)
  }

  const checkCurrentUser = async () => {
    const user = await StorageService.getCurrentUser()
    setCurrentUser(user)
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await loadProducts()
    setRefreshing(false)
  }

  const showAddToCartModal = (product: Product) => {
    if (!currentUser || currentUser.role !== "customer") {
      Alert.alert("Acceso denegado", "Solo los clientes pueden agregar productos al carrito")
      return
    }

    setSelectedProduct(product)
    setQuantity("1")
    setModalVisible(true)
  }

  const addToCart = async () => {
    if (!selectedProduct) return

    const qty = Number.parseInt(quantity)
    if (isNaN(qty) || qty <= 0) {
      Alert.alert("Error", "Ingresa una cantidad válida")
      return
    }

    if (qty > selectedProduct.stock) {
      Alert.alert("Stock insuficiente", `Solo hay ${selectedProduct.stock} unidades disponibles`)
      return
    }

    try {
      const success = await StorageService.addToCart(selectedProduct.id, qty)
      if (success) {
        Alert.alert("Éxito", `${qty} ${selectedProduct.name}(s) agregado(s) al carrito`)
        setModalVisible(false)
        loadProducts() // Recargar para actualizar stock
      } else {
        Alert.alert("Error", "No se pudo agregar al carrito")
      }
    } catch (error) {
      Alert.alert("Error", "No se pudo agregar al carrito")
    }
  }

  const renderProduct = ({ item }: { item: Product }) => (
    <View style={styles.productCard}>
      <Image source={{ uri: item.image }} style={styles.productImage} />
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productDescription}>{item.description}</Text>
        <Text style={styles.productPrice}>Bs. {item.price.toLocaleString()}</Text>
        <Text style={styles.productStock}>Stock: {item.stock}</Text>
        {currentUser?.role === "customer" && (
          <TouchableOpacity
            style={[styles.addButton, item.stock <= 0 && styles.addButtonDisabled]}
            onPress={() => showAddToCartModal(item)}
            disabled={item.stock <= 0}
          >
            <Text style={styles.addButtonText}>{item.stock <= 0 ? "Sin Stock" : "Agregar al Carrito"}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  )

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tienda</Text>
      {currentUser?.role !== "customer" && (
        <Text style={styles.accessDenied}>Solo los clientes pueden ver y comprar productos</Text>
      )}

      <FlatList
        data={currentUser?.role === "customer" ? products : []}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.listContainer}
      />

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Agregar al Carrito</Text>
            <Text style={styles.modalProductName}>{selectedProduct?.name}</Text>
            <Text style={styles.modalPrice}>Bs. {selectedProduct?.price.toLocaleString()}</Text>
            <Text style={styles.modalStock}>Stock disponible: {selectedProduct?.stock}</Text>

            <Text style={styles.quantityLabel}>Cantidad:</Text>
            <TextInput
              style={styles.quantityInput}
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="numeric"
              placeholder="1"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmButton} onPress={addToCart}>
                <Text style={styles.confirmButtonText}>Agregar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  productCard: {
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
  productImage: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
  },
  productInfo: {
    gap: 8,
  },
  productName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  productDescription: {
    fontSize: 14,
    color: "#666",
  },
  productPrice: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2196F3",
  },
  productStock: {
    fontSize: 12,
    color: "#888",
  },
  addButton: {
    backgroundColor: "#4CAF50",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  addButtonDisabled: {
    backgroundColor: "#ccc",
  },
  addButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  accessDenied: {
    textAlign: "center",
    color: "#f44336",
    fontSize: 16,
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    width: "80%",
    maxWidth: 300,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
  },
  modalProductName: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 8,
  },
  modalPrice: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2196F3",
    textAlign: "center",
    marginBottom: 8,
  },
  modalStock: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 16,
  },
  quantityLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  quantityInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#666",
    fontWeight: "600",
  },
  confirmButton: {
    flex: 1,
    backgroundColor: "#4CAF50",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  confirmButtonText: {
    color: "white",
    fontWeight: "600",
  },
})
