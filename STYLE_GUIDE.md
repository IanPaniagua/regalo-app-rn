# Style Guide - Regalo App

## Componentes UI Reutilizables

### AppCard
Tarjeta con fondo sólido para contenido destacado.

**Uso:**
```tsx
import { AppCard } from '@/src/components/ui';

// Tarjeta sólida con borde (default)
<AppCard>
  <AppText>Contenido</AppText>
</AppCard>

// Tarjeta transparente
<AppCard variant="transparent">
  <AppText>Contenido</AppText>
</AppCard>

// Sin borde
<AppCard bordered={false}>
  <AppText>Contenido</AppText>
</AppCard>
```

**Props:**
- `variant`: `'solid'` (default) | `'transparent'`
  - `solid`: Usa `theme.inputBg` (blanco en light, #2A2A2A en dark)
  - `transparent`: Usa `theme.cardBg` (transparente)
- `bordered`: `boolean` (default: `true`)

**Cuándo usar:**
- ✅ Tarjetas de usuario
- ✅ Items de lista
- ✅ Formularios
- ✅ Modales
- ✅ Cualquier contenido que necesite destacar

### AppSection
Contenedor de sección con fondo transparente.

**Uso:**
```tsx
import { AppSection } from '@/src/components/ui';

<AppSection>
  <AppCard>Item 1</AppCard>
  <AppCard>Item 2</AppCard>
</AppSection>
```

**Cuándo usar:**
- ✅ Agrupar múltiples tarjetas
- ✅ Secciones de contenido (My Connections, Pending, etc.)
- ✅ Contenedores que necesitan fondo sutil

## Jerarquía Visual

### Niveles de fondo (de más transparente a más sólido):

1. **Fondo de app** (`theme.background`)
   - Imagen de fondo visible
   
2. **Secciones** (`theme.cardBg` - transparente)
   - Usa `<AppSection>` o `variant="transparent"`
   - Permite ver la imagen de fondo
   
3. **Tarjetas/Items** (`theme.inputBg` - sólido)
   - Usa `<AppCard>` o `variant="solid"`
   - Fondo sólido que destaca sobre la sección

### Ejemplo de jerarquía correcta:

```tsx
<AppContainer> {/* Fondo de app */}
  <AppSection> {/* Fondo transparente */}
    <AppCard>Usuario 1</AppCard> {/* Fondo sólido */}
    <AppCard>Usuario 2</AppCard> {/* Fondo sólido */}
  </AppSection>
</AppContainer>
```

## Colores de Texto

### Light Mode:
- `theme.text`: `#0F172A` - Texto principal (casi negro)
- `theme.textSecondary`: `#1E293B` - Texto secundario
- `theme.textMuted`: `#475569` - Texto menos importante

### Dark Mode:
- `theme.text`: `#FFFFFF` - Texto principal (blanco)
- `theme.textSecondary`: `#CCCCCC` - Texto secundario
- `theme.textMuted`: `#999999` - Texto menos importante

## Bordes

**Siempre usar:**
```tsx
borderWidth: 1,
borderColor: theme.border,
```

**Para destacar (ej: invitaciones):**
```tsx
borderWidth: 2,
borderColor: colors.primary, // Dorado
```

## Border Radius

- **Tarjetas pequeñas**: `12px`
- **Secciones/Contenedores**: `16px`
- **Modales**: `20px`
- **Botones**: `8-12px`

## Padding

- **Tarjetas**: `16px`
- **Secciones**: `16px`
- **Modales**: `20px`

## Consistencia

### ❌ NO hacer:
```tsx
// Colores hardcodeados
backgroundColor: '#FFFFFF'
color: '#000000'

// Estilos inline repetidos
style={{ backgroundColor: theme.inputBg, borderWidth: 1, borderColor: theme.border, borderRadius: 12 }}
```

### ✅ SÍ hacer:
```tsx
// Usar componentes reutilizables
<AppCard>
  <AppText>Contenido</AppText>
</AppCard>

// O usar theme dinámico
style={{ backgroundColor: theme.inputBg }}
```

## Migración de código existente

Si encuentras código con estilos hardcodeados:

1. Identifica si es una tarjeta → usa `<AppCard>`
2. Identifica si es una sección → usa `<AppSection>`
3. Reemplaza colores fijos por `theme.*`
4. Usa los componentes de texto: `<AppText>`, `<AppTitle>`

## Ejemplos de uso en la app

### Connect - User Cards
```tsx
<AppSection>
  {users.map(user => (
    <AppCard key={user.id}>
      <AppText>{user.name}</AppText>
    </AppCard>
  ))}
</AppSection>
```

### Profile - Info Fields
```tsx
<AppCard>
  <AppText style={{ color: theme.textSecondary }}>Email</AppText>
  <AppText>{user.email}</AppText>
</AppCard>
```

### Calendar - Day Cells
```tsx
<AppSection variant="transparent">
  <AppCard bordered>
    <AppText>{day}</AppText>
  </AppCard>
</AppSection>
```
