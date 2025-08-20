"use client"

import { useState, useEffect } from "react"
import { View, Text, TouchableOpacity, StyleSheet, Alert, TextInput } from "react-native"
import { StorageService, type User } from "@/services/storage"

export default function ProfileScreen() {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")

  useEffect(() => {
    loadCurrentUser()

    const handleUpdate = () => {
      loadCurrentUser()
    }

    StorageService.addListener(handleUpdate)

    return () => {
      StorageService.removeListener(handleUpdate)
    }
  }, [])

  const loadCurrentUser = async () => {
    const user = await StorageService.getCurrentUser()
    setCurrentUser(user)
  }

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Error", "Completa todos los campos")
      return
    }

    try {
      const user = await StorageService.login(email.trim(), password.trim())

      if (user) {
        setEmail("")
        setPassword("")
        Alert.alert("Éxito", `Bienvenido ${user.name}`)
      } else {
        Alert.alert("Error", "Credenciales incorrectas")
      }
    } catch (error) {
      Alert.alert("Error", "No se pudo iniciar sesión")
    }
  }

  const handleRegister = async () => {
    if (!email.trim() || !name.trim() || !password.trim()) {
      Alert.alert("Error", "Completa todos los campos")
      return
    }

    try {
      const newUser = await StorageService.addUser({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: password.trim(),
        role: "customer",
      })

      await StorageService.setCurrentUser(newUser)
      setEmail("")
      setName("")
      setPassword("")
      Alert.alert("Éxito", `Cuenta creada para ${newUser.name}`)
    } catch (error) {
      Alert.alert("Error", error instanceof Error ? error.message : "No se pudo crear la cuenta")
    }
  }

  const handleLogout = async () => {
    Alert.alert("Cerrar Sesión", "¿Estás seguro que deseas cerrar sesión?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Cerrar Sesión",
        style: "destructive",
        onPress: async () => {
          try {
            await StorageService.logout()
          } catch (error) {
            Alert.alert("Error", "No se pudo cerrar sesión")
          }
        },
      },
    ])
  }

  if (currentUser) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Mi Perfil</Text>

        <View style={styles.profileCard}>
          <Text style={styles.profileLabel}>Nombre:</Text>
          <Text style={styles.profileValue}>{currentUser.name}</Text>

          <Text style={styles.profileLabel}>Email:</Text>
          <Text style={styles.profileValue}>{currentUser.email}</Text>

          <Text style={styles.profileLabel}>Rol:</Text>
          <Text style={styles.profileValue}>{currentUser.role === "admin" ? "Administrador" : "Cliente"}</Text>

          <Text style={styles.profileLabel}>Miembro desde:</Text>
          <Text style={styles.profileValue}>{new Date(currentUser.createdAt).toLocaleDateString()}</Text>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{isLogin ? "Iniciar Sesión" : "Crear Cuenta"}</Text>

      <View style={styles.formCard}>
        {!isLogin && (
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Nombre:</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Tu nombre completo"
              autoCapitalize="words"
            />
          </View>
        )}

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Email:</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="tu@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Contraseña:</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Contraseña"
            secureTextEntry
          />
        </View>

        <TouchableOpacity style={styles.submitButton} onPress={isLogin ? handleLogin : handleRegister}>
          <Text style={styles.submitButtonText}>{isLogin ? "Iniciar Sesión" : "Crear Cuenta"}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.switchButton}
          onPress={() => {
            setIsLogin(!isLogin)
            setEmail("")
            setName("")
            setPassword("")
          }}
        >
          <Text style={styles.switchButtonText}>
            {isLogin ? "¿No tienes cuenta? Crear una" : "¿Ya tienes cuenta? Iniciar sesión"}
          </Text>
        </TouchableOpacity>

        <View style={styles.demoAccounts}>
          <Text style={styles.demoTitle}>Cuentas de prueba:</Text>
          <Text style={styles.demoText}>Admin: admin@app.com / admin123</Text>
          <Text style={styles.demoText}>Cliente: cliente@app.com / cliente123</Text>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    paddingTop: 50,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#333",
  },
  profileCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  profileLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    marginTop: 12,
    marginBottom: 4,
  },
  profileValue: {
    fontSize: 16,
    color: "#333",
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  logoutButton: {
    backgroundColor: "#f44336",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  logoutButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  formCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
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
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  },
  submitButton: {
    backgroundColor: "#2196F3",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 16,
  },
  submitButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  switchButton: {
    alignItems: "center",
    marginBottom: 20,
  },
  switchButtonText: {
    color: "#2196F3",
    fontSize: 14,
  },
  demoAccounts: {
    backgroundColor: "#f0f8ff",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e3f2fd",
  },
  demoTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#1976d2",
    marginBottom: 4,
  },
  demoText: {
    fontSize: 11,
    color: "#1976d2",
  },
})
