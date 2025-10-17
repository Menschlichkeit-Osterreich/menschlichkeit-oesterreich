# 🌍 Geocoding Integration - Nominatim

**Provider:** Nominatim (OpenStreetMap)  
**Alternative:** Google Maps Geocoding API  
**Purpose:** Convert addresses to geographic coordinates (Lat/Lon)

---

## 🎯 Übersicht

Geocoding-Integration zur automatischen Konvertierung von Kontaktadressen in Koordinaten für Mapping, Distance-Calculation und Geographic Segmentation.

---

## 🔧 Setup

### Option A: Nominatim (OpenStreetMap) ✅ Empfohlen

**Vorteile:**
- ✅ Kostenlos & Open Source
- ✅ Keine API-Keys erforderlich
- ✅ Gute Abdeckung für Europa/Österreich
- ✅ DSGVO-konform (EU-Server)

**Nachteile:**
- ⚠️ Rate Limit: 1 request/second
- ⚠️ Weniger präzise als Google (v.a. rural areas)

**CiviCRM Configuration:**
```
Administer → System Settings → Mapping and Geocoding

Geocoding Provider: Nominatim
Endpoint URL: https://nominatim.openstreetmap.org
User Agent: Menschlichkeit-Oesterreich/1.0 (contact@menschlichkeit-oesterreich.at)
Rate Limit: 1 request/second
Timeout: 30 seconds
```

---

### Option B: Google Maps Geocoding API

**Vorteile:**
- ✅ Sehr präzise
- ✅ Hohe Verfügbarkeit
- ✅ 40,000 requests/month kostenlos

**Nachteile:**
- ⚠️ API-Key erforderlich
- ⚠️ Kosten ab 40k requests/month
- ⚠️ Datenschutz-Überlegungen (US-Server)

**CiviCRM Configuration:**
```
Geocoding Provider: Google
API Key: ${GOOGLE_MAPS_API_KEY}
```

**Google Cloud Setup:**
```
1. Google Cloud Console → APIs & Services
2. Enable "Geocoding API"
3. Create Credentials → API Key
4. Restrict Key:
   - API Restrictions: Geocoding API only
   - IP Restrictions: Server IP
```

---

## 📍 Geocoding Process

### Automatic Geocoding (Scheduled Job)

**Job:** `Geocode and Parse Addresses`

**Configuration:**
```
Administer → System Settings → Scheduled Jobs

Job: Geocode and Parse Addresses
Frequency: Hourly
Parameters:
  - throttle: 1 (seconds between requests)
  - batch_size: 100 (addresses per run)
  - only_new: Yes (skip already geocoded)
```

**Workflow:**
```
1. Fetch Addresses (not geocoded)
   SELECT * FROM civicrm_address
   WHERE geo_code_1 IS NULL
     AND geo_code_2 IS NULL
     AND country_id IS NOT NULL
   LIMIT 100;

2. For each address:
   a) Build query string:
      street_address, postal_code, city, country
   
   b) Call Nominatim API:
      GET https://nominatim.openstreetmap.org/search
      ?q={street}, {postal_code} {city}, {country}
      &format=json
      &limit=1
   
   c) Parse response:
      {
        "lat": "48.2082",
        "lon": "16.3738",
        "display_name": "Stephansplatz, Vienna, Austria"
      }
   
   d) Update address:
      UPDATE civicrm_address
      SET geo_code_1 = 48.2082,  -- Latitude
          geo_code_2 = 16.3738   -- Longitude
      WHERE id = {address_id};

3. Wait 1 second (rate limit)

4. Repeat for next address
```

---

### Manual Geocoding

**Use Case:** Single contact address update

**Method 1: Contact Edit Screen**
```
Contacts → Edit Contact → Address Tab
[x] Geocode Address on Save

→ Automatically geocodes when saving address
```

**Method 2: Batch Geocoding**
```
Search → Find Contacts
Results → Actions → Geocode Addresses

→ Geocodes all selected contacts
```

**Method 3: API**
```bash
# CiviCRM API
cv api Address.geocode id=123

# Or via APIv4
cv api4 Address.update +w id=123 \
  +v geo_code_1=48.2082 +v geo_code_2=16.3738
```

---

## 🗺️ Address Parsing

### Austria-Specific Format

**Input Address:**
```
Stephansplatz 3
1010 Wien
Österreich
```

**Nominatim Query:**
```
https://nominatim.openstreetmap.org/search?
  q=Stephansplatz+3,+1010+Wien,+Austria
  &format=json
  &addressdetails=1
  &limit=1
```

**Response:**
```json
{
  "place_id": 123456,
  "lat": "48.2082",
  "lon": "16.3738",
  "display_name": "3, Stephansplatz, Innere Stadt, Vienna, 1010, Austria",
  "address": {
    "house_number": "3",
    "road": "Stephansplatz",
    "suburb": "Innere Stadt",
    "city": "Vienna",
    "postcode": "1010",
    "country": "Austria",
    "country_code": "at"
  },
  "boundingbox": ["48.2080", "48.2084", "16.3736", "16.3740"]
}
```

---

## 📊 Use Cases

### 1. Contact Map Visualization

**SearchKit Display: Map**

```yaml
Saved Search: "Kontakte (Geocoded)"
Display Type: Map
Coordinates: geo_code_1 (Lat), geo_code_2 (Lon)
Popup: Contact Name, Address, Phone

Filters:
  - City (Vienna, Graz, Linz, Salzburg)
  - Membership Type
  - Contact Type
```

**Frontend Implementation:**
```javascript
// Using Leaflet.js
import L from 'leaflet';

const map = L.map('contact-map').setView([48.2082, 16.3738], 12);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Add markers for each contact
contacts.forEach(contact => {
  if (contact.geo_code_1 && contact.geo_code_2) {
    L.marker([contact.geo_code_1, contact.geo_code_2])
      .addTo(map)
      .bindPopup(`
        <strong>${contact.display_name}</strong><br>
        ${contact.street_address}<br>
        ${contact.postal_code} ${contact.city}
      `);
  }
});
```

---

### 2. Distance Calculation

**SQL Function:**
```sql
-- Calculate distance between two points (Haversine formula)
CREATE FUNCTION calculate_distance(
  lat1 DECIMAL(10,7),
  lon1 DECIMAL(10,7),
  lat2 DECIMAL(10,7),
  lon2 DECIMAL(10,7)
)
RETURNS DECIMAL(10,2)
DETERMINISTIC
BEGIN
  DECLARE R INT DEFAULT 6371; -- Earth radius in km
  DECLARE dLat DECIMAL(10,7);
  DECLARE dLon DECIMAL(10,7);
  DECLARE a DECIMAL(10,7);
  DECLARE c DECIMAL(10,7);
  
  SET dLat = RADIANS(lat2 - lat1);
  SET dLon = RADIANS(lon2 - lon1);
  SET a = SIN(dLat/2) * SIN(dLat/2) +
          COS(RADIANS(lat1)) * COS(RADIANS(lat2)) *
          SIN(dLon/2) * SIN(dLon/2);
  SET c = 2 * ATAN2(SQRT(a), SQRT(1-a));
  
  RETURN R * c;
END;
```

**Query Contacts within X km:**
```sql
-- Find contacts within 10km of Vienna center
SET @vienna_lat = 48.2082;
SET @vienna_lon = 16.3738;

SELECT
  c.id,
  c.display_name,
  a.city,
  a.geo_code_1 AS lat,
  a.geo_code_2 AS lon,
  calculate_distance(@vienna_lat, @vienna_lon, a.geo_code_1, a.geo_code_2) AS distance_km
FROM civicrm_contact c
JOIN civicrm_address a ON c.id = a.contact_id
WHERE a.is_primary = 1
  AND a.geo_code_1 IS NOT NULL
HAVING distance_km <= 10
ORDER BY distance_km ASC;
```

---

### 3. Geographic Segmentation

**Smart Group: "Vienna Area (10km Radius)"**

```sql
-- Smart Group Criteria
SELECT contact_a.id
FROM civicrm_contact contact_a
LEFT JOIN civicrm_address address ON contact_a.id = address.contact_id
WHERE address.is_primary = 1
  AND calculate_distance(48.2082, 16.3738, address.geo_code_1, address.geo_code_2) <= 10;
```

**Use Cases:**
- Event Invitations (local events)
- Regional Campaigns
- Branch Assignment
- Service Area Verification

---

### 4. Event Location Mapping

**CiviEvent Integration:**

```yaml
Event: "Workshop Demokratie"
Location:
  - Address: Stephansplatz 3, 1010 Wien
  - Geocoded: Yes (auto on save)
  - Lat: 48.2082
  - Lon: 16.3738

Frontend:
  - Event Detail Page → Show Map (Leaflet)
  - "Get Directions" Link → Google Maps
  - Nearby Contacts → Auto-suggest attendees within 5km
```

---

## 🔄 Batch Operations

### Geocode All Addresses (Initial Setup)

**Script:** `automation/scripts/civicrm/geocode-all.sh`

```bash
#!/bin/bash
# Geocode all addresses in batches

BATCH_SIZE=100
DELAY=1  # seconds between requests

# Get total count
TOTAL=$(cv api Address.getcount +w geo_code_1:is_null=1)
echo "Total addresses to geocode: $TOTAL"

# Process in batches
for ((i=0; i<$TOTAL; i+=$BATCH_SIZE)); do
  echo "Processing batch $((i/$BATCH_SIZE + 1))..."
  
  # Get addresses
  cv api4 Address.get \
    +w geo_code_1:is_null=1 \
    +l $BATCH_SIZE \
    --out=json | \
  jq -r '.values[].id' | \
  while read address_id; do
    # Geocode single address
    cv api Address.geocode id=$address_id
    
    # Respect rate limit
    sleep $DELAY
  done
  
  echo "Batch complete. $(($TOTAL - $i - $BATCH_SIZE)) remaining."
done

echo "Geocoding complete!"
```

**Usage:**
```bash
chmod +x automation/scripts/civicrm/geocode-all.sh
./automation/scripts/civicrm/geocode-all.sh
```

---

## 📈 Data Quality

### Geocoding Success Rate

**Report:**
```sql
SELECT
  country_id.label AS country,
  COUNT(*) AS total_addresses,
  SUM(IF(a.geo_code_1 IS NOT NULL, 1, 0)) AS geocoded,
  ROUND(SUM(IF(a.geo_code_1 IS NOT NULL, 1, 0)) / COUNT(*) * 100, 2) AS success_rate
FROM civicrm_address a
LEFT JOIN civicrm_country country_id ON a.country_id = country_id.id
WHERE a.is_primary = 1
GROUP BY a.country_id
ORDER BY success_rate DESC;
```

**Expected Rates:**
- Austria: > 90%
- Germany: > 85%
- Other EU: > 80%
- Non-EU: > 70%

---

### Failed Geocoding

**Reasons:**
1. **Incomplete Address:** Missing city or postal code
2. **Invalid Format:** Typos, wrong country
3. **Rural Areas:** Not in Nominatim database
4. **API Errors:** Rate limit, timeout

**Review Failed:**
```sql
-- Addresses with failed geocoding attempts
SELECT
  c.id,
  c.display_name,
  a.street_address,
  a.city,
  a.postal_code,
  country.label AS country
FROM civicrm_contact c
JOIN civicrm_address a ON c.id = a.contact_id
LEFT JOIN civicrm_country country ON a.country_id = country.id
WHERE a.geo_code_1 IS NULL
  AND a.street_address IS NOT NULL
  AND a.city IS NOT NULL
ORDER BY a.country_id, a.city;
```

**Manual Fix:**
```
1. Review address for errors
2. Fix typos/missing data
3. Re-run geocoding
4. OR manually set coordinates (Google Maps → Right-click → Copy coordinates)
```

---

## 🔐 Privacy & GDPR

### Data Storage

**Fields:**
- `geo_code_1` (Latitude): Stored in CiviCRM database
- `geo_code_2` (Longitude): Stored in CiviCRM database

**Precision:** 7 decimal places (~1.1cm accuracy)

**Privacy Consideration:**
- Exact coordinates can identify individual homes
- For public display: Round to 3 decimals (~111m accuracy)

**Obfuscation (Public Maps):**
```sql
-- Round coordinates for privacy
SELECT
  ROUND(geo_code_1, 3) AS lat_public,
  ROUND(geo_code_2, 3) AS lon_public
FROM civicrm_address
WHERE id = 123;
```

---

### GDPR Rights

**Right to Access:**
- Include coordinates in data export

**Right to Erasure:**
- Delete coordinates on contact anonymization:
```sql
UPDATE civicrm_address
SET geo_code_1 = NULL,
    geo_code_2 = NULL
WHERE contact_id = {deleted_contact_id};
```

---

## 🧪 Testing

### Test Addresses (Austria)

```yaml
Test 1: Vienna Center
  Address: Stephansplatz 3, 1010 Wien
  Expected:
    Lat: 48.2082
    Lon: 16.3738

Test 2: Graz
  Address: Hauptplatz 1, 8010 Graz
  Expected:
    Lat: 47.0708
    Lon: 15.4382

Test 3: Rural
  Address: Dorfstraße 12, 6352 Ellmau
  Expected:
    Lat: ~47.5
    Lon: ~12.3
    (May be less precise)
```

**Test Procedure:**
```
1. Create test contact with address
2. Run: cv api Address.geocode id={address_id}
3. Verify:
   SELECT geo_code_1, geo_code_2 FROM civicrm_address WHERE id = {address_id};
4. Compare with Google Maps coordinates
5. Cleanup: Delete test contact
```

---

## 🚨 Troubleshooting

### Issue: Geocoding fails silently

**Diagnostics:**
```bash
# Enable debug logging
cv api4 Setting.set +v debug_enabled=1

# Check CiviCRM logs
tail -f /var/www/html/sites/default/files/civicrm/ConfigAndLog/CiviCRM.*.log

# Test Nominatim directly
curl "https://nominatim.openstreetmap.org/search?q=Stephansplatz+3+Vienna&format=json"
```

**Fix:**
- Check internet connectivity from server
- Verify User-Agent header (Nominatim requires it)
- Check for rate limiting (429 Too Many Requests)

---

### Issue: Coordinates incorrect

**Cause:** Address ambiguity (e.g., "Hauptstraße" exists in many cities)

**Prevention:**
- Always include city + postal code
- Include country for international addresses

**Fix:**
- Manual correction via Contact Edit → Address → Set coordinates

---

## 📊 Performance

### Benchmarks

**Nominatim:**
- Response Time: 200-500ms per request
- Rate Limit: 1 req/second = 3,600 addresses/hour
- 10,000 addresses: ~3 hours

**Google:**
- Response Time: 100-200ms per request
- Rate Limit: ~50 req/second = 180,000 addresses/hour
- 10,000 addresses: ~3 minutes

**Recommendation:**
- **Initial Import (>5,000 addresses):** Use Google (pay for bulk)
- **Ongoing (< 100/day):** Use Nominatim (free)

---

## 🔮 Future Enhancements

- [ ] **Reverse Geocoding:** Coordinates → Address (validate data)
- [ ] **Address Validation:** Standardize formats (USPS, Canada Post APIs)
- [ ] **IP Geolocation:** Visitor location for event suggestions
- [ ] **Geofencing:** Auto-assign contacts to regional groups

---

## 📚 Resources

- **Nominatim Docs:** https://nominatim.org/release-docs/latest/
- **Google Geocoding API:** https://developers.google.com/maps/documentation/geocoding
- **Leaflet.js:** https://leafletjs.com/
- **CiviCRM Mapping:** https://docs.civicrm.org/user/en/latest/organising-your-data/mapping/

---

<div align="center">
  <br />
  <strong>🌍 Geocoding Integration Complete</strong>
  <br />
  <sub>Nominatim | Automated Batch Processing | Privacy-Aware</sub>
</div>
