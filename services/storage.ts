import AsyncStorage from "@react-native-async-storage/async-storage"

// Tipos de datos
export interface User {
  id: string
  name: string
  email: string
  password: string // Added password field for all users
  role: "admin" | "customer"
  createdAt: string
}

export interface Product {
  id: string
  name: string
  description: string
  price: number
  stock: number
  image: string
  createdAt: string
}

export interface CartItem {
  productId: string
  quantity: number
}

export interface Order {
  id: string
  userId: string
  items: CartItem[]
  total: number
  status: "pending" | "confirmed" | "delivered"
  createdAt: string
}

// Claves de AsyncStorage
const KEYS = {
  USERS: "users",
  PRODUCTS: "products",
  ORDERS: "orders",
  CART: "cart",
  CURRENT_USER: "currentUser",
}

// Funciones genéricas de storage
export const StorageService = {
  // Usuarios
  async getUsers(): Promise<User[]> {
    try {
      const data = await AsyncStorage.getItem(KEYS.USERS)
      return data ? JSON.parse(data) : []
    } catch (error) {
      console.error("Error getting users:", error)
      return []
    }
  },

  async saveUsers(users: User[]): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.USERS, JSON.stringify(users))
      this.notifyListeners() // Notify components of data changes
    } catch (error) {
      console.error("Error saving users:", error)
    }
  },

  async addUser(user: Omit<User, "id" | "createdAt">): Promise<User> {
    const users = await this.getUsers()

    const existingUser = users.find((u) => u.email.toLowerCase() === user.email.toLowerCase())
    if (existingUser) {
      throw new Error("El email ya está registrado")
    }

    const newUser: User = {
      ...user,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    }
    users.push(newUser)
    await this.saveUsers(users)
    return newUser
  },

  async updateUser(id: string, updates: Partial<User>): Promise<void> {
    const users = await this.getUsers()
    const index = users.findIndex((u) => u.id === id)
    if (index !== -1) {
      users[index] = { ...users[index], ...updates }
      await this.saveUsers(users)
    }
  },

  async deleteUser(id: string): Promise<void> {
    const users = await this.getUsers()
    const filtered = users.filter((u) => u.id !== id)
    await this.saveUsers(filtered)
  },

  // Productos
  async getProducts(): Promise<Product[]> {
    try {
      const data = await AsyncStorage.getItem(KEYS.PRODUCTS)
      return data ? JSON.parse(data) : []
    } catch (error) {
      console.error("Error getting products:", error)
      return []
    }
  },

  async saveProducts(products: Product[]): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.PRODUCTS, JSON.stringify(products))
      this.notifyListeners() // Notify components of data changes
    } catch (error) {
      console.error("Error saving products:", error)
    }
  },

  async addProduct(product: Omit<Product, "id" | "createdAt">): Promise<Product> {
    const products = await this.getProducts()
    const newProduct: Product = {
      ...product,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    }
    products.push(newProduct)
    await this.saveProducts(products)
    return newProduct
  },

  async updateProduct(id: string, updates: Partial<Product>): Promise<void> {
    const products = await this.getProducts()
    const index = products.findIndex((p) => p.id === id)
    if (index !== -1) {
      products[index] = { ...products[index], ...updates }
      await this.saveProducts(products)
    }
  },

  async deleteProduct(id: string): Promise<void> {
    const products = await this.getProducts()
    const filtered = products.filter((p) => p.id !== id)
    await this.saveProducts(filtered)
  },

  // Pedidos
  async getOrders(): Promise<Order[]> {
    try {
      const data = await AsyncStorage.getItem(KEYS.ORDERS)
      return data ? JSON.parse(data) : []
    } catch (error) {
      console.error("Error getting orders:", error)
      return []
    }
  },

  async saveOrders(orders: Order[]): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.ORDERS, JSON.stringify(orders))
      this.notifyListeners() // Notify components of data changes
    } catch (error) {
      console.error("Error saving orders:", error)
    }
  },

  async addOrder(order: Omit<Order, "id" | "createdAt">): Promise<Order> {
    const orders = await this.getOrders()
    const newOrder: Order = {
      ...order,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    }
    orders.push(newOrder)
    await this.saveOrders(orders)
    return newOrder
  },

  async updateOrder(id: string, updates: Partial<Order>): Promise<void> {
    const orders = await this.getOrders()
    const index = orders.findIndex((o) => o.id === id)
    if (index !== -1) {
      orders[index] = { ...orders[index], ...updates }
      await this.saveOrders(orders)
    }
  },

  // Carrito
  async getCart(): Promise<CartItem[]> {
    try {
      const data = await AsyncStorage.getItem(KEYS.CART)
      return data ? JSON.parse(data) : []
    } catch (error) {
      console.error("Error getting cart:", error)
      return []
    }
  },

  async saveCart(cart: CartItem[]): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.CART, JSON.stringify(cart))
      this.notifyListeners() // Notify components of data changes
    } catch (error) {
      console.error("Error saving cart:", error)
    }
  },

  async addToCart(productId: string, quantity = 1): Promise<boolean> {
    try {
      const products = await this.getProducts()
      const product = products.find((p) => p.id === productId)

      if (!product || product.stock < quantity) {
        return false // No hay suficiente stock
      }

      const cart = await this.getCart()
      const existingItem = cart.find((item) => item.productId === productId)

      if (existingItem) {
        // Verificar que no exceda el stock disponible
        if (product.stock < existingItem.quantity + quantity) {
          return false
        }
        existingItem.quantity += quantity
      } else {
        cart.push({ productId, quantity })
      }

      // Reducir stock del producto
      await this.updateProduct(productId, { stock: product.stock - quantity })
      await this.saveCart(cart)
      return true
    } catch (error) {
      console.error("Error adding to cart:", error)
      return false
    }
  },

  async removeFromCart(productId: string): Promise<void> {
    try {
      const cart = await this.getCart()
      const itemToRemove = cart.find((item) => item.productId === productId)

      if (itemToRemove) {
        // Devolver stock al producto
        const products = await this.getProducts()
        const product = products.find((p) => p.id === productId)
        if (product) {
          await this.updateProduct(productId, {
            stock: product.stock + itemToRemove.quantity,
          })
        }
      }

      const filtered = cart.filter((item) => item.productId !== productId)
      await this.saveCart(filtered)
    } catch (error) {
      console.error("Error removing from cart:", error)
    }
  },

  async updateCartItemQuantity(productId: string, newQuantity: number): Promise<boolean> {
    try {
      const cart = await this.getCart()
      const products = await this.getProducts()
      const product = products.find((p) => p.id === productId)
      const cartItem = cart.find((item) => item.productId === productId)

      if (!product || !cartItem) return false

      const quantityDifference = newQuantity - cartItem.quantity

      // Verificar si hay suficiente stock
      if (quantityDifference > 0 && product.stock < quantityDifference) {
        return false
      }

      // Actualizar stock
      await this.updateProduct(productId, {
        stock: product.stock - quantityDifference,
      })

      // Actualizar carrito
      cartItem.quantity = newQuantity
      if (newQuantity <= 0) {
        const filtered = cart.filter((item) => item.productId !== productId)
        await this.saveCart(filtered)
      } else {
        await this.saveCart(cart)
      }

      return true
    } catch (error) {
      console.error("Error updating cart quantity:", error)
      return false
    }
  },

  async clearCart(): Promise<void> {
    await AsyncStorage.removeItem(KEYS.CART)
  },

  // Usuario actual
  async getCurrentUser(): Promise<User | null> {
    try {
      const data = await AsyncStorage.getItem(KEYS.CURRENT_USER)
      return data ? JSON.parse(data) : null
    } catch (error) {
      console.error("Error getting current user:", error)
      return null
    }
  },

  async setCurrentUser(user: User): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(user))
      this.notifyListeners() // Notify components of data changes
    } catch (error) {
      console.error("Error setting current user:", error)
    }
  },

  async logout(): Promise<void> {
    try {
      await AsyncStorage.removeItem(KEYS.CURRENT_USER)
      this.notifyListeners() // Notify components of data changes
    } catch (error) {
      console.error("Error during logout:", error)
    }
  },

  // Login with password validation
  async login(email: string, password: string): Promise<User | null> {
    try {
      const users = await this.getUsers()
      const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase())

      if (user && user.password === password) {
        await this.setCurrentUser(user)
        this.notifyListeners() // Notify components of data changes
        return user
      }

      return null
    } catch (error) {
      console.error("Error during login:", error)
      return null
    }
  },

  async checkAdminPermission(): Promise<boolean> {
    const currentUser = await this.getCurrentUser()
    return currentUser?.role === "admin"
  },

  async checkCustomerPermission(): Promise<boolean> {
    const currentUser = await this.getCurrentUser()
    return currentUser?.role === "customer"
  },

  // Inicializar datos de ejemplo
  async initializeData(): Promise<void> {
    const users = await this.getUsers()
    const products = await this.getProducts()

    // Crear usuarios por defecto con contraseñas
    if (users.length === 0) {
      await this.addUser({
        name: "Administrador",
        email: "admin@app.com",
        password: "admin123", // Added password for admin
        role: "admin",
      })

      await this.addUser({
        name: "Cliente Demo",
        email: "cliente@app.com",
        password: "cliente123", // Added password for customer
        role: "customer",
      })
    }

    // Crear productos de ejemplo con precios en bolivianos
    if (products.length === 0) {
      const sampleProducts = [
        {
          name: "Laptop Gaming",
          description: "Laptop para gaming de alta gama",
          price: 8400, // Bs. 8,400
          stock: 5,
          image: "https://via.placeholder.com/200x200?text=Laptop",
        },
        {
          name: "Mouse Inalámbrico",
          description: "Mouse ergonómico inalámbrico",
          price: 175, // Bs. 175
          stock: 20,
          image: "https://via.placeholder.com/200x200?text=Mouse",
        },
        {
          name: "Teclado Mecánico",
          description: "Teclado mecánico RGB",
          price: 560, // Bs. 560
          stock: 15,
          image: "https://via.placeholder.com/200x200?text=Teclado",
        },
        {
          name: "Monitor 4K",
          description: "Monitor 4K de 27 pulgadas",
          price: 2450, // Bs. 2,450
          stock: 8,
          image: "https://via.placeholder.com/200x200?text=Monitor",
        },
      ]

      for (const product of sampleProducts) {
        await this.addProduct(product)
      }
    }
  },

  listeners: new Set<() => void>(),

  addListener(callback: () => void) {
    this.listeners.add(callback)
  },

  removeListener(callback: () => void) {
    this.listeners.delete(callback)
  },

  notifyListeners() {
    this.listeners.forEach((callback) => callback())
  },
}
