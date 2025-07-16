# Trip Planner App

A comprehensive React application for planning trips with full CRUD operations, JSON data management, and detailed day-by-day itineraries.

## 🚀 **New Features**

✅ **Full CRUD Operations**: Add, edit, and delete everything through the UI  
✅ **JSON Data Storage**: Persistent localStorage with import/export functionality  
✅ **Trip Info Management**: Edit trip name, description, and dates  
✅ **Day Management**: Add, edit, delete, and reorder trip days  
✅ **Place Management**: Complete CRUD operations for places to visit  
✅ **Accommodation Management**: Edit hotel details for each day  
✅ **Image Management**: Add and remove images for each day  
✅ **Data Import/Export**: Save and load trip data as JSON files  
✅ **Auto-save**: All changes automatically saved to browser storage  

## Core Features

### **Complete CRUD Interface**
- **No Code Editing Required**: Everything manageable through the UI
- **Real-time Updates**: Changes immediately reflected and saved
- **Confirmation Dialogs**: Safe deletion with confirmation prompts
- **Form Validation**: Ensures data integrity with required fields

### **Trip Information Management**
- **Edit Trip Details**: Click edit button next to trip name
- **Trip Dates**: Set start and end dates for smart day navigation
- **Trip Description**: Add detailed trip descriptions
- **Auto-generated Filenames**: Export files named after your trip

### **Day Management**
- **Add New Days**: Click "Add Day" to create new itinerary days
- **Edit Day Details**: Modify region, drive time, distance, and Maps URL
- **Delete Days**: Remove days with automatic day number reordering
- **Smart Default Opening**: Current day opens automatically based on dates

### **Place Management**
- **Add Places**: Click "Add Place" button in any day section
- **Edit Places**: Click edit icon next to any place
- **Delete Places**: Remove places with one click
- **Auto-generated Maps**: Google Maps links generated automatically

### **Accommodation Management**
- **Edit Hotels**: Click edit icon next to accommodation name
- **Website Links**: Add optional hotel website URLs
- **Maps Integration**: Automatic Google Maps link generation

### **Image Management**
- **Add Images**: Click "Add Image" to include photos for each day
- **Remove Images**: Delete images with the trash icon
- **URL Support**: Add images via URL (supports any web-accessible image)

### **Data Management**
- **Export Data**: Download your trip as a JSON file
- **Import Data**: Load previously saved trip data
- **Reset Data**: Restore to default example data
- **Auto-save**: All changes automatically saved to browser storage

## Technology Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS for responsive design
- **UI Components**: shadcn/ui for consistent, accessible components
- **Icons**: Lucide React for beautiful icons
- **Data Storage**: localStorage with JSON import/export
- **Build Tool**: Vite for fast development and building

## Getting Started

### Prerequisites
- Node.js (16.6.0 or higher recommended)
- npm or yarn

### Installation & Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start the development server**:
   ```bash
   npm run dev
   ```

3. **Open your browser** to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

## Usage Guide

### **Managing Trip Information**

1. **Edit Trip Details**: Click the edit icon next to the trip name
2. **Update Dates**: Set accurate start/end dates for smart day navigation
3. **Add Description**: Provide a detailed trip description

### **Managing Days**

1. **Add New Day**: Click "Add Day" in the header
2. **Edit Day**: Click the edit icon in any day's header
3. **Delete Day**: Click the trash icon in any day's header
4. **Fill Day Details**:
   - Region/Location (required)
   - Drive time in hours
   - Distance in kilometers
   - Google Maps embed URL

### **Managing Places**

1. **Add Place**: Click "Add Place" in any day's places section
2. **Edit Place**: Click the edit icon next to any place
3. **Delete Place**: Click the trash icon next to any place
4. **Fill Place Details**:
   - Name (required)
   - Description (required)
   - Website URL (optional)
   - Google Maps URL (auto-generated if empty)

### **Managing Accommodation**

1. **Edit Hotel**: Click the edit icon next to the accommodation name
2. **Update Details**:
   - Hotel name (required)
   - Website URL (optional)
   - Google Maps URL (auto-generated if empty)

### **Managing Images**

1. **Add Image**: Click "Add Image" in any day's images section
2. **Remove Image**: Click the trash icon on any image
3. **Use any web-accessible image URL**

### **Data Management**

1. **Export Data**: Click "Export" to download your trip as JSON
2. **Import Data**: Click "Import" to load a previously saved trip
3. **Reset Data**: Click "Reset" to restore example data
4. **Auto-save**: All changes automatically saved to browser

## Google Maps Integration

### **Getting Embed URLs**
1. Go to Google Maps
2. Search for your route or location
3. Click "Share" → "Embed a map"
4. Copy the iframe src URL
5. Paste into the Google Maps Embed URL field

### **Auto-generated Links**
- Place and accommodation Google Maps links are automatically generated
- Can be customized by editing the place/accommodation details

## Data Format

The app uses JSON format for data storage:

```json
{
  "tripInfo": {
    "name": "Trip Name",
    "startDate": "2024-01-01",
    "endDate": "2024-01-03",
    "description": "Trip description"
  },
  "days": [
    {
      "id": "unique-id",
      "dayNumber": 1,
      "region": "Location",
      "driveTimeHours": 2.5,
      "driveDistanceKm": 150,
      "googleMapsEmbedUrl": "https://...",
      "accommodation": {
        "name": "Hotel Name",
        "websiteUrl": "https://...",
        "googleMapsUrl": "https://..."
      },
      "places": [...],
      "images": [...]
    }
  ]
}
```

## File Structure

```
src/
├── components/
│   ├── ui/                     # shadcn/ui components
│   ├── TripPlanner.tsx         # Main trip planning component
│   ├── TripHeader.tsx          # Header with trip info and actions
│   ├── AddPlaceModal.tsx       # Modal for adding places
│   ├── EditPlaceModal.tsx      # Modal for editing places
│   ├── EditDayModal.tsx        # Modal for editing day details
│   ├── EditAccommodationModal.tsx # Modal for editing accommodation
│   └── AddDayModal.tsx         # Modal for adding new days
├── hooks/
│   └── useTripData.ts          # Data management hook
├── data/
│   └── tripData.json           # Default trip data
├── lib/
│   └── utils.ts                # Utility functions
├── App.tsx                     # Main app component
├── main.tsx                    # App entry point
└── index.css                   # Global styles
```

## Key Features in Detail

### **Persistent Storage**
- All data automatically saved to browser's localStorage
- Survives browser restarts and refreshes
- No data loss during development

### **Import/Export**
- Export creates downloadable JSON files
- Import validates data format before loading
- Perfect for backing up or sharing trips

### **Smart UI**
- Confirmation dialogs for destructive actions
- Form validation with helpful error messages
- Auto-focus on important fields
- Responsive design for mobile and desktop

### **Data Validation**
- Required fields clearly marked
- URL validation for website and maps links
- Auto-generation of Google Maps links
- Proper error handling for invalid data

## Troubleshooting

### **Common Issues**

1. **Data Not Saving**: Check browser localStorage permissions
2. **Import Fails**: Ensure JSON file format is correct
3. **Maps Not Loading**: Verify Google Maps embed URL format
4. **Images Not Showing**: Check image URL accessibility

### **Resetting Data**
If you encounter issues, use the "Reset" button to restore default data.

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).

## Support

For questions or issues, please create an issue in the repository.

---

**Now with complete CRUD operations and JSON data management!** 🌍✈️📝

**No more code editing required - manage everything through the beautiful UI!** 