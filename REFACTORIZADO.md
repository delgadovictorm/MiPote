# 🏗️ Refactorización Modular de Pollitos Finanzas

## 📋 Nueva Estructura de Carpetas

```
pollitos-finanzas/
├── app/
│   └── dashboard/
│       └── page.tsx                 # [REFACTORIZADO] Componente principal
│
├── components/
│   ├── AnimatedNum.tsx              # [NUEVO] Componente para números animados
│   ├── TransactionDrawer.tsx        # [EXTRAÍDO] Drawer de transacciones
│   └── Auth/
│       ├── AuthFlow.tsx             # [NUEVO] Orquestador del flujo de auth
│       ├── WelcomeScreen.tsx        # [EXTRAÍDO] Pantalla de bienvenida
│       ├── LoginForm.tsx            # [EXTRAÍDO] Formulario de login
│       ├── RegisterFormStep1.tsx    # [EXTRAÍDO] Registro paso 1
│       ├── RegisterFormStep2.tsx    # [EXTRAÍDO] Registro paso 2
│       └── LoadingScreen.tsx        # [EXTRAÍDO] Pantalla de cargando
│
├── lib/
│   ├── supabase.ts                  # [EXISTENTE] Configuración Supabase
│   ├── auth.ts                      # [NUEVO] Funciones de autenticación
│   ├── transactions.ts              # [NUEVO] Funciones de transacciones
│   └── spaces.ts                    # [NUEVO] Funciones de espacios
│
└── types/
    └── index.ts                     # [NUEVO] Tipos e interfaces globales
```

## 🎯 Cambios Principales

### 1. **Separación de Responsabilidades**

#### **Antes** (2584 líneas en un solo archivo):
- Todo mezclado en `dashboard/page.tsx`
- Difícil de mantener y debuggear
- Componentes interdependientes

#### **Ahora** (Modular):
- **Auth/**: Todo relacionado con autenticación
- **Lib/auth.ts**: Lógica de autenticación
- **Lib/transactions.ts**: Manejo de transacciones
- **Lib/spaces.ts**: Gestión de espacios (potes, vacas, billetera)
- **Types/index.ts**: Tipos compartidos

### 2. **Componentes Extraídos**

#### `components/Auth/`
- `WelcomeScreen.tsx` - Pantalla inicial
- `LoginForm.tsx` - Formulario de login
- `RegisterFormStep1.tsx` - Registro (correo y contraseña)
- `RegisterFormStep2.tsx` - Registro (nombre y teléfono)
- `LoadingScreen.tsx` - Pantalla de cargando
- `AuthFlow.tsx` - Orquestador de todo el flujo

### 3. **Funciones Organizadas**

#### `lib/auth.ts`
```typescript
- generarCodigo()
- cargarDatosUsuario()
- handleLoginUser()
- handleRegisterUser()
- handleLogout()
- fetchExchangeRates()
- unirseAlEspacio()
```

#### `lib/transactions.ts`
```typescript
- calcularMontos()
- crearTransaccion()
- eliminarTransaccion()
- obtenerTransacciones()
- getSaldosAislados()
- getPatrimonioNeto()
- getPoteAhorrado()
```

#### `lib/spaces.ts`
```typescript
- crearEspacio()
- actualizarNombreEspacio()
- eliminarEspacio()
- obtenerEspacios()
- obtenerParticipantes()
- agregarParticipante()
- crearMeta()
- actualizarMeta()
- eliminarMeta()
- obtenerRecordatorios()
- crearRecordatorio()
```

## 📦 Tipos Centralizados (`types/index.ts`)

```typescript
- User
- Espacio
- Participante
- Transaccion
- Meta (Potes)
- Presupuesto
- Cashea
- Recordatorio
- GastoFijo
- ExchangeRates
- Saldos
- Perfil
- Theme
```

## 🚀 Próximos Pasos

### Fase 2: Dashboard Modular
```
components/Dashboard/
├── InicioTab.tsx          # Pantalla principal
├── PotsTab.tsx            # Gestión de potes
├── VacasTab.tsx           # Gestión de vacas
├── BilletaTab.tsx         # Mi billetera
├── RecordatoriosTab.tsx   # Lista de tareas
├── PagosTab.tsx           # Control presupuestario, cashea, fijos
└── EmergenciaTab.tsx      # Fondo de emergencia
```

### Fase 3: Componentes Compartidos
```
components/Shared/
├── BalanceCard.tsx        # Card de balance
├── TransactionHistory.tsx # Historial de transacciones
├── PotsSection.tsx        # Sección de potes
└── ActionButtons.tsx      # Botones de acciones
```

### Fase 4: Modales
```
components/Modals/
├── JoinSpaceModal.tsx     # Unirse con código
├── ProfileModal.tsx       # Editar perfil
├── PaywallModal.tsx       # Paywall de pro
└── BalanceDetailsModal.tsx # Detalles de liquidez
```

## 🔄 Migración del Archivo Original

El archivo `dashboard/page.tsx` original (2584 líneas) ha sido refactorizado:

1. ✅ Componentes de Auth extraídos
2. ✅ Tipos centralizados
3. ✅ Funciones helpers en `lib/`
4. 🔄 Dashboard se modularizará en próxima fase
5. 🔄 Modales se separarán en componentes individuales

## 💡 Beneficios

| Aspecto | Antes | Después |
|--------|-------|--------|
| Líneas por archivo | 2584 | <300 (main) |
| Reutilización | Baja | Alta |
| Mantenibilidad | Difícil | Fácil |
| Testing | Complejo | Modular |
| Escalabilidad | Limitada | Excelente |

## 📝 Guía de Uso

### Importar componentes de Auth
```typescript
import { AuthFlow } from "@/components/Auth/AuthFlow";

<AuthFlow
  onAuthSuccess={handleSuccess}
  onGuestEnter={handleGuestEnter}
/>
```

### Usar funciones de autenticación
```typescript
import { handleLoginUser, cargarDatosUsuario } from "@/lib/auth";

const { error } = await handleLoginUser(email, password);
```

### Usar tipos globales
```typescript
import type { Espacio, Perfil, Transaccion } from "@/types";

const espacio: Espacio = { ... };
```

## 🔗 Referencias Cruzadas

- **Login** ↔️ **lib/auth.ts** - Manejo de sesiones
- **Potes** ↔️ **lib/spaces.ts** - CRUD de metas
- **Transacciones** ↔️ **lib/transactions.ts** - Cálculos financieros
- **Dashboard** ↔️ **Todos los anteriores** - Orquestación

## ⚡ Próxima Iteración

1. Refactorizar `FinanzasDashboardContent` en componentes tab-específicos
2. Crear modales como componentes individuales
3. Agregar tests unitarios para cada módulo
4. Documentar patrones y convenciones del equipo
