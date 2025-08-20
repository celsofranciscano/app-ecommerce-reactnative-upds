"use client"

import { useState, useEffect } from "react"
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, TextInput, Modal } from "react-native"
import { StorageService, type User } from "@/services/storage"

export default function UsersAdmin() {
  const [users, setUsers] = useState<User[]>([])
  const [modalVisible, setModalVisible] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "", // Added password field
    role: "customer" as "admin" | "customer",
  })

  useEffect(() => {
    loadUsers()

    const handleUpdate = () => {
      loadUsers()
    }

    StorageService.addListener(handleUpdate)

    return () => {
      StorageService.removeListener(handleUpdate)
    }
  }, [])

  const loadUsers = async () => {
    const hasPermission = await StorageService.checkAdminPermission()
    if (!hasPermission) {
      Alert.alert("Error", "No tienes permisos para acceder a esta sección")
      return
    }

    const usersData = await StorageService.getUsers()
    setUsers(usersData)
  }

  const openModal = (user?: User) => {
    if (user) {
      setEditingUser(user)
      setFormData({
        name: user.name,
        email: user.email,
        password: user.password, // Load existing password
        role: user.role,
      })
    } else {
      setEditingUser(null)
      setFormData({
        name: "",
        email: "",
        password: "", // Reset password field
        role: "customer",
      })
    }
    setModalVisible(true)
  }

  const closeModal = () => {
    setModalVisible(false)
    setEditingUser(null)
    setFormData({ name: "", email: "", password: "", role: "customer" })
  }

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.email.trim() || (!editingUser && !formData.password.trim())) {
      Alert.alert("Error", "Completa todos los campos")
      return
    }

    const hasPermission = await StorageService.checkAdminPermission()
    if (!hasPermission) {
      Alert.alert("Error", "No tienes permisos para realizar esta acción")
      return
    }

    try {
      if (editingUser) {
        const updateData = formData.password.trim()
          ? formData
          : { name: formData.name, email: formData.email, role: formData.role }
        await StorageService.updateUser(editingUser.id, updateData)
        Alert.alert("Éxito", "Usuario actualizado")
      } else {
        await StorageService.addUser(formData)
        Alert.alert("Éxito", "Usuario creado")
      }
      closeModal()
      loadUsers()
    } catch (error) {
      Alert.alert("Error", error instanceof Error ? error.message : "No se pudo guardar el usuario")
    }
  }

  const handleDelete = (user: User) => {
    Alert.alert("Confirmar eliminación", `¿Estás seguro de eliminar a ${user.name}?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          const hasPermission = await StorageService.checkAdminPermission()
          if (!hasPermission) {
            Alert.alert("Error", "No tienes permisos para realizar esta acción")
            return
          }

          await StorageService.deleteUser(user.id)
          loadUsers()
          Alert.alert("Éxito", "Usuario eliminado")
        },
      },
    ])
  }

  const renderUser = ({ item }: { item: User }) => (
    <View style={styles.userCard}>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.name}</Text>
        <Text style={styles.userEmail}>{item.email}</Text>
        <Text style={styles.userRole}>{item.role === "admin" ? "Administrador" : "Cliente"}</Text>
        <Text style={styles.userDate}>Creado: {new Date(item.createdAt).toLocaleDateString()}</Text>
      </View>
      <View style={styles.userActions}>
        <TouchableOpacity style={styles.editButton} onPress={() => openModal(item)}>
          <Text style={styles.editButtonText}>Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item)}>
          <Text style={styles.deleteButtonText}>Eliminar</Text>
        </TouchableOpacity>
      </View>
    </View>
  )

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Gestión de Usuarios</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => openModal()}>
          <Text style={styles.addButtonText}>+ Agregar</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={users}
        renderItem={renderUser}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
      />

      <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={closeModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{editingUser ? "Editar Usuario" : "Nuevo Usuario"}</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nombre:</Text>
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                placeholder="Nombre completo"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email:</Text>
              <TextInput
                style={styles.input}
                value={formData.email}
                onChangeText={(text) => setFormData({ ...formData, email: text })}
                placeholder="email@ejemplo.com"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                Contraseña {editingUser ? "(dejar vacío para mantener actual)" : ""}:
              </Text>
              <TextInput
                style={styles.input}
                value={formData.password}
                onChangeText={(text) => setFormData({ ...formData, password: text })}
                placeholder={editingUser ? "Nueva contraseña (opcional)" : "Contraseña"}
                secureTextEntry
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Rol:</Text>
              <View style={styles.roleContainer}>
                <TouchableOpacity
                  style={[styles.roleButton, formData.role === "customer" && styles.roleButtonActive]}
                  onPress={() => setFormData({ ...formData, role: "customer" })}
                >
                  <Text style={[styles.roleButtonText, formData.role === "customer" && styles.roleButtonTextActive]}>
                    Cliente
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.roleButton, formData.role === "admin" && styles.roleButtonActive]}
                  onPress={() => setFormData({ ...formData, role: "admin" })}
                >
                  <Text style={[styles.roleButtonText, formData.role === "admin" && styles.roleButtonTextActive]}>
                    Admin
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={closeModal}>
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>Guardar</Text>
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
  addButton: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  addButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  listContainer: {
    paddingBottom: 20,
  },
  userCard: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  userEmail: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  userRole: {
    fontSize: 12,
    color: "#2196F3",
    marginTop: 2,
    fontWeight: "600",
  },
  userDate: {
    fontSize: 10,
    color: "#999",
    marginTop: 2,
  },
  userActions: {
    flexDirection: "row",
    gap: 8,
  },
  editButton: {
    backgroundColor: "#2196F3",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  editButtonText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  deleteButton: {
    backgroundColor: "#f44336",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  deleteButtonText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    width: "90%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#333",
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
    padding: 12,
    fontSize: 16,
  },
  roleContainer: {
    flexDirection: "row",
    gap: 8,
  },
  roleButton: {
    flex: 1,
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#ddd",
    alignItems: "center",
  },
  roleButtonActive: {
    backgroundColor: "#2196F3",
    borderColor: "#2196F3",
  },
  roleButtonText: {
    fontSize: 14,
    color: "#666",
  },
  roleButtonTextActive: {
    color: "white",
    fontWeight: "bold",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#ddd",
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#666",
    fontWeight: "bold",
  },
  saveButton: {
    flex: 1,
    backgroundColor: "#4CAF50",
    padding: 12,
    borderRadius: 6,
    alignItems: "center",
  },
  saveButtonText: {
    color: "white",
    fontWeight: "bold",
  },
})
