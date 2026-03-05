// yaklasik bounding box hesapla (1 derece ~ 111 km)
export const getBoundingBox = (lat, lng, radiusKm) => {
    const latDelta = radiusKm / 111;
    const lngDelta = radiusKm / (111 * Math.cos(lat * (Math.PI / 180)));

    return {
        minLat: lat - latDelta,
        maxLat: lat + latDelta,
        minLng: lng - lngDelta,
        maxLng: lng + lngDelta
    };
};

// haversine formulu ile iki nokta arasi mesafe (km)
export const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLng = (lng2 - lng1) * (Math.PI / 180);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

// radius icindeki kullanicilari filtrele
export const filterNearbyUsers = (users, centerLat, centerLng, radiusKm) => {
    return users.filter(user => {
        if (!user.location) return false;
        const dist = calculateDistance(centerLat, centerLng, user.location.lat, user.location.lng);
        return dist <= radiusKm;
    });
};
