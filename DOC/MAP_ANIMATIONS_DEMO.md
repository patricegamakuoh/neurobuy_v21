# Map Animation Icons - Demo Guide

## Overview
The tracking map features intelligent, context-aware animated icons that adapt based on the delivery status and location type.

## Icon Types & Animations

### 1. 📦 Pickup Location
- **Icon**: Box emoji
- **Color**: Green (#10b981)
- **Animation**: Bounce (vertical movement)
- **When Used**: Always for pickup/warehouse locations
- **Behavior**: Gentle up-down motion

### 2. Transit Locations (Status-Based)

#### ✈️ International Transit
- **Icon**: Plane emoji
- **Color**: Blue (#3b82f6)
- **Animation**: Circular movement (simulating flight path)
- **When Used**: When `status: 'international'`
- **Behavior**: Moves in a circular pattern (up-right-down-left)
- **Use Case**: Cross-country or international shipping

#### 🚚 Domestic Transit
- **Icon**: Truck emoji
- **Color**: Orange (#f59e0b)
- **Animation**: Horizontal back-and-forth
- **When Used**: When `status: 'domestic'` or no status specified (default)
- **Behavior**: Moves left-right like a truck on the road
- **Use Case**: Domestic shipping within the country

#### 🏍️ Last-Mile Delivery
- **Icon**: Motorcycle emoji
- **Color**: Orange (#f59e0b)
- **Animation**: Rotation with translation
- **When Used**: When `status: 'last-mile'`
- **Behavior**: Rotates slightly while moving side-to-side
- **Use Case**: Final delivery to customer address

### 3. 🏠 Delivery Location
- **Icon**: House emoji
- **Color**: Red (#ef4444)
- **Animation**: Pulse (grows and shrinks)
- **When Used**: Always for delivery/final destination
- **Behavior**: Gentle pulse effect

## Animation Details

### Bounce Animation (Pickup)
```css
@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}
```
- Duration: 2 seconds
- Loop: Infinite
- Effect: Creates a floating/bobbing effect

### Move Plane Animation (International)
```css
@keyframes movePlan {
  0% { transform: translateX(-5px) translateY(-5px); }
  25% { transform: translateX(5px) translateY(0px); }
  50% { transform: translateX(5px) translateY(5px); }
  75% { transform: translateX(-5px) translateY(0px); }
  100% { transform: translateX(-5px) translateY(-5px); }
}
```
- Duration: 3 seconds
- Loop: Infinite
- Effect: Circular flying motion

### Move Truck Animation (Domestic)
```css
@keyframes moveTruck {
  0% { transform: translateX(-8px); }
  50% { transform: translateX(8px); }
  100% { transform: translateX(-8px); }
}
```
- Duration: 2 seconds
- Loop: Infinite
- Effect: Road-like horizontal movement

### Rotate Bike Animation (Last-Mile)
```css
@keyframes rotateBike {
  0% { transform: rotate(-15deg) translateX(-5px); }
  50% { transform: rotate(15deg) translateX(5px); }
  100% { transform: rotate(-15deg) translateX(-5px); }
}
```
- Duration: 2 seconds
- Loop: Infinite
- Effect: Bike leaning and moving

### Pulse Animation (Delivery)
```css
@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}
```
- Duration: 1.5 seconds
- Loop: Infinite
- Effect: Attention-grabbing pulse

## Usage Examples

### Scenario 1: China to Cameroon Order
```javascript
// Initial pickup
pickupLocation: {
  lat: 39.9042,
  lng: 116.4074,
  address: 'Beijing, China'
}

// International transit phase
currentLocation: {
  lat: 35.7589,
  lng: 51.3753,
  address: 'Tehran, Iran',
  status: 'international'  // Shows plane icon
}

// Arrived in Cameroon (domestic transit)
currentLocation: {
  lat: 4.0511,
  lng: 9.7678,
  address: 'Douala, Cameroon',
  status: 'domestic'  // Shows truck icon
}

// Last-mile delivery
currentLocation: {
  lat: 3.8667,
  lng: 11.5167,
  address: 'Yaoundé, Cameroon',
  status: 'last-mile'  // Shows bike icon
}

// Final delivery
deliveryLocation: {
  lat: 3.8667,
  lng: 11.5167,
  address: 'Customer Address, Yaoundé, Cameroon'
}
```

### Scenario 2: Domestic Order (Same Country)
```javascript
pickupLocation: {
  lat: 3.8667,
  lng: 11.5167,
  address: 'Yaoundé Warehouse'
}

currentLocation: {
  lat: 4.0511,
  lng: 9.7678,
  address: 'En route to Douala',
  status: 'domestic'  // Default truck icon
}

deliveryLocation: {
  lat: 4.0511,
  lng: 9.7678,
  address: 'Customer Address, Douala'
}
```

## Benefits

### Visual Clarity
- ✅ Instantly understand delivery status at a glance
- ✅ Different icons for different transportation methods
- ✅ Animations draw attention to current location

### User Experience
- ✅ Reduces cognitive load (no need to read text)
- ✅ Professional, modern appearance
- ✅ Engaging and informative

### Logistics Optimization
- ✅ Clear visualization of transit phases
- ✅ Helps vendors plan efficient routes
- ✅ Customers can track exact delivery phase

## Technical Implementation

The status is passed via the `currentLocation` prop:
```javascript
<OrderTrackingMap
  currentLocation={{
    lat: 4.0511,
    lng: 9.7678,
    address: 'In transit',
    status: 'international' // Determines icon
  }}
/>
```

The component automatically selects the appropriate icon and animation based on the `status` value:
- `'international'` → Plane (circular animation)
- `'domestic'` → Truck (horizontal animation)
- `'last-mile'` → Bike (rotation animation)
- No status → Truck (default domestic)
