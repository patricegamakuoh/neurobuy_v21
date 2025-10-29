# Map Tracking Guide

## Overview
The map tracking feature allows both vendors and customers to track order deliveries in real-time on an interactive map.

## Features

### For Vendors (Logistics Registration)
- **Location Selection**: Select service regions by choosing cities on a map
- **Visual Coverage**: See all selected service locations as markers on the map
- **Coordinate Display**: View exact latitude and longitude for each location
- **Interactive Map**: Zoom, pan, and explore service coverage areas

### For Customers & Vendors (Order Tracking)
- **Route Visualization**: See pickup, current, and delivery locations
- **Real-time Tracking**: Track goods in transit (when implemented)
- **Route Lines**: View the delivery route between locations
- **Location Details**: Click markers to see addresses and coordinates

## Map Components

### 1. Service Coverage Map (Vendors)
**Component**: `MapboxMap` (`components/MapboxMap.jsx`)
**Usage**: Used in logistics registration form
**Features**:
- Shows all selected service cities as markers
- Displays location count in top-right corner
- Click markers to see city names and coordinates
- Auto-fits to show all selected locations

### 2. Order Tracking Map (Customers & Vendors)
**Component**: `OrderTrackingMap` (`components/OrderTrackingMap.jsx`)
**Usage**: Used in order tracking pages
**Features**:
- 📦 **Green bouncing icon**: Pickup location with bounce animation
- **Transit Icons** (animated based on status):
  - ✈️ **Blue plane**: International transit (moves in circular motion)
  - 🚚 **Orange truck**: Domestic transit (moves left-right)
  - 🏍️ **Orange bike**: Last-mile delivery (rotates)
- 🏠 **Red pulsing icon**: Delivery location
- Blue dashed line: Route between locations
- Auto-fits to show entire route
- Status-aware icon selection

## Implementation Example

### For Vendors (Logistics Registration)
```jsx
import dynamic from 'next/dynamic'

const MapboxMap = dynamic(() => import('@/components/MapboxMap'), {
  ssr: false
})

// In your form:
<MapboxMap locations={selectedRegions} />
```

### For Order Tracking
```jsx
import OrderTrackingMap from '@/components/OrderTrackingMap'

// Example 1: Domestic Transit (Truck)
<OrderTrackingMap
  pickupLocation={{ 
    lat: 3.8667, 
    lng: 11.5167, 
    address: 'Yaoundé, Cameroon' 
  }}
  deliveryLocation={{ 
    lat: 4.0511, 
    lng: 9.7678, 
    address: 'Douala, Cameroon' 
  }}
  currentLocation={{ 
    lat: 3.9500, 
    lng: 10.5000,
    address: 'En route',
    status: 'domestic'  // Shows truck icon
  }}
  height="500px"
/>

// Example 2: International Transit (Plane)
<OrderTrackingMap
  currentLocation={{ 
    lat: 5.3600, 
    lng: -4.0083,
    address: 'Abidjan, Ivory Coast',
    status: 'international'  // Shows plane icon
  }}
/>

// Example 3: Last-Mile Delivery (Bike)
<OrderTrackingMap
  currentLocation={{ 
    lat: 3.9500, 
    lng: 10.5000,
    address: 'Approaching destination',
    status: 'last-mile'  // Shows bike icon
  }}
/>
```

## Props

### MapboxMap Props
| Prop | Type | Description |
|------|------|-------------|
| `locations` | `string[]` | Array of city names to display as markers |

### OrderTrackingMap Props
| Prop | Type | Description |
|------|------|-------------|
| `pickupLocation` | `object` | `{lat, lng, address}` - Pickup point |
| `deliveryLocation` | `object` | `{lat, lng, address}` - Delivery point |
| `currentLocation` | `object` | `{lat, lng, address, status}` - Current location (optional)<br/>`status` options:<br/>- `'international'` → ✈️ Plane icon<br/>- `'domestic'` → 🚚 Truck icon<br/>- `'last-mile'` → 🏍️ Bike icon |
| `height` | `string` | Map height (default: '400px') |

## Coordinate Reference

### Major African Cities
The system includes coordinates for major cities across:
- Cameroon (Yaoundé, Douala, Buea, etc.)
- Nigeria (Lagos, Abuja, Kano, etc.)
- Ghana (Accra, Kumasi, etc.)
- Kenya (Nairobi, Mombasa, etc.)
- Senegal (Dakar, Thiès, etc.)
- Ivory Coast (Abidjan, Yamoussoukro, etc.)

## Usage Scenarios

### Scenario 1: Vendor Selecting Service Regions
1. Vendor goes to "Become a Logistics Provider" page
2. Selects country (e.g., Cameroon)
3. Selects provinces/states
4. Selects cities within provinces
5. Map automatically shows all selected cities as markers
6. Vendor can click markers to verify locations

### Scenario 2: Customer Tracking Order
1. Customer places an order
2. Goes to "Orders" page
3. Clicks "Track Order"
4. Sees map with:
   - Green marker: Where order was picked up
   - Yellow marker: Current location (if in transit)
   - Red marker: Delivery address
   - Blue line: Route from pickup to delivery

### Scenario 3: Vendor Managing Delivery
1. Vendor receives delivery request
2. Views order details with tracking map
3. Sees pickup and delivery locations
4. Can plan optimal route
5. Updates current location as goods move

## Integration with Orders

To integrate with the orders system, you'll need to:

1. **Store Location Data** in the order record:
```javascript
// In orders table
{
  pickupAddress: "Yaoundé, Cameroon",
  pickupCoords: { lat: 3.8667, lng: 11.5167 },
  deliveryAddress: "Douala, Cameroon",
  deliveryCoords: { lat: 4.0511, lng: 9.7678 },
  currentLocation: { lat: 3.9500, lng: 10.5000 }
}
```

2. **Update Tracking Page** to use the map:
```jsx
// In app/orders/track/[orderId]/page.jsx
import OrderTrackingMap from '@/components/OrderTrackingMap'

export default function TrackOrder({ order }) {
  return (
    <OrderTrackingMap
      pickupLocation={order.pickupCoords}
      deliveryLocation={order.deliveryCoords}
      currentLocation={order.currentLocation}
    />
  )
}
```

## Benefits

### For Vendors:
- ✅ Visual confirmation of service areas
- ✅ Easy to see coverage gaps
- ✅ Professional presentation to customers
- ✅ Coordinate-based accurate targeting

### For Customers:
- ✅ Real-time order location
- ✅ Transparent delivery process
- ✅ Estimated delivery time awareness
- ✅ Peace of mind knowing package location

### For Platform:
- ✅ Professional tracking experience
- ✅ Reduced customer inquiries
- ✅ Better logistics planning
- ✅ Competitive advantage

## Future Enhancements

- [ ] Real-time GPS tracking integration
- [ ] Automatic route optimization
- [ ] Estimated delivery time calculation
- [ ] Push notifications on location updates
- [ ] Delivery person tracking
- [ ] Multi-stop delivery routes
- [ ] Historical delivery route visualization
