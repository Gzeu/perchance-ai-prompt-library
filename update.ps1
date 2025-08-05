# generate-encyclopedia.ps1
Write-Host "🎨 Generating Encyclopedia Data Files..." -ForegroundColor Cyan

$path = "src/data"
if (!(Test-Path $path)) { 
    New-Item -ItemType Directory -Path $path -Force 
    Write-Host "Created directory: $path" -ForegroundColor Green
}

# Generate styles.json
Set-Content -Path "$path/styles.json" -Value @'
[
  {
    "key": "anime",
    "name": "Anime/Manga Style",
    "description": "Japanese animation style with clean lines and vibrant colors",
    "category": "Animation",
    "tags": ["japan", "manga", "animation", "colorful", "2d"],
    "variables": ["character pose", "hair style", "eye color", "clothing"],
    "artists": ["Hayao Miyazaki", "Akira Toriyama"],
    "examples": ["magical girl", "mecha pilot"],
    "popularity": 95,
    "recommended": true,
    "negativePrompts": ["3d render", "photorealistic"],
    "variableCount": 4
  },
  {
    "key": "photorealistic",
    "name": "Photorealistic Photography",
    "description": "Ultra-realistic photography style with natural lighting",
    "category": "Photography",
    "tags": ["realistic", "photography", "detailed", "natural"],
    "variables": ["lighting setup", "camera angle", "composition"],
    "artists": ["Annie Leibovitz", "Steve McCurry"],
    "examples": ["portrait", "landscape", "street photography"],
    "popularity": 90,
    "recommended": true,
    "negativePrompts": ["cartoon", "anime", "painting"],
    "variableCount": 3
  }
]
'@ -Encoding UTF8

# Generate subjects.json
Set-Content -Path "$path/subjects.json" -Value @'
[
  {
    "category": "Fantasy Characters",
    "subjects": [
      {
        "name": "Dragon Knight",
        "tags": ["fantasy", "warrior", "dragon", "armor"],
        "popularity": 96,
        "compatibleStyles": ["fantasy", "digital_art"],
        "variations": ["armored knight", "dragon rider"]
      },
      {
        "name": "Magical Witch",
        "tags": ["fantasy", "magic", "spell", "mystical"],
        "popularity": 94,
        "compatibleStyles": ["fantasy", "anime"],
        "variations": ["young witch", "elder sorceress"]
      }
    ]
  },
  {
    "category": "Sci-Fi Characters",
    "subjects": [
      {
        "name": "Space Marine",
        "tags": ["sci-fi", "warrior", "space", "armor"],
        "popularity": 85,
        "compatibleStyles": ["sci-fi", "digital_art"],
        "variations": ["power armor", "space trooper"]
      }
    ]
  }
]
'@ -Encoding UTF8

# Generate artists.json
Set-Content -Path "$path/artists.json" -Value @'
[
  {
    "name": "Leonardo da Vinci",
    "period": "Renaissance",
    "years": "1452-1519",
    "country": "Italy",
    "keywords": ["classical", "sfumato", "detailed"],
    "styles": ["renaissance", "classical"],
    "famousWorks": ["Mona Lisa", "The Last Supper"],
    "techniques": ["sfumato", "chiaroscuro"],
    "popularity": 98
  },
  {
    "name": "Vincent van Gogh",
    "period": "Post-Impressionism",
    "years": "1853-1890",
    "country": "Netherlands",
    "keywords": ["swirling", "vibrant", "emotional"],
    "styles": ["impressionist", "expressive"],
    "famousWorks": ["Starry Night", "Sunflowers"],
    "techniques": ["impasto", "bold brushstrokes"],
    "popularity": 97
  },
  {
    "name": "Hayao Miyazaki",
    "period": "Contemporary Animation",
    "years": "1941-present",
    "country": "Japan",
    "keywords": ["studio ghibli", "whimsical", "detailed"],
    "styles": ["anime", "animation"],
    "famousWorks": ["Spirited Away", "My Neighbor Totoro"],
    "techniques": ["hand-drawn animation"],
    "popularity": 95
  }
]
'@ -Encoding UTF8

# Generate themes.json
Set-Content -Path "$path/themes.json" -Value @'
[
  {
    "name": "Epic Adventure",
    "description": "Grand heroic journeys and legendary quests",
    "category": "Action",
    "keywords": ["heroic", "quest", "adventure"],
    "ageGroup": "10+",
    "popularity": 94,
    "compatibleStyles": ["cinematic", "fantasy"]
  },
  {
    "name": "Peaceful Nature",
    "description": "Serene natural environments and tranquil scenes",
    "category": "Nature",
    "keywords": ["peaceful", "serene", "natural"],
    "ageGroup": "all",
    "popularity": 88,
    "compatibleStyles": ["impressionist", "photorealistic"]
  },
  {
    "name": "Dark Mystery",
    "description": "Gothic and mysterious atmospheric themes",
    "category": "Mystery",
    "keywords": ["dark", "mysterious", "gothic"],
    "ageGroup": "13+",
    "popularity": 82,
    "compatibleStyles": ["gothic", "dark_fantasy"]
  }
]
'@ -Encoding UTF8

# Generate negatives.json
Set-Content -Path "$path/negatives.json" -Value @'
{
  "universal": [
    "blurry", "low quality", "worst quality", "bad anatomy", 
    "bad hands", "watermark", "signature", "text"
  ],
  "anime": [
    "3d", "photorealistic", "western cartoon", "realistic"
  ],
  "photorealistic": [
    "anime", "cartoon", "painting", "drawn", "sketch"
  ],
  "fantasy": [
    "modern clothing", "cars", "phones", "contemporary"
  ]
}
'@ -Encoding UTF8

# Generate recipes.json
Set-Content -Path "$path/recipes.json" -Value @'
[
  {
    "name": "Epic Fantasy Portrait",
    "description": "Professional fantasy character portrait template",
    "style": "fantasy",
    "components": {
      "qualityModifiers": ["masterpiece", "best quality", "8k"],
      "styleModifiers": ["fantasy art", "digital painting"],
      "lightingSetup": ["dramatic lighting", "cinematic lighting"],
      "composition": ["dynamic pose", "heroic stance"]
    },
    "negativePrompts": ["blurry", "low quality", "modern"],
    "difficulty": "advanced",
    "category": "Character"
  },
  {
    "name": "Anime Character Standard",
    "description": "High-quality anime character template",
    "style": "anime",
    "components": {
      "qualityModifiers": ["masterpiece", "best quality"],
      "styleModifiers": ["anime style", "2d"],
      "characterDetails": ["detailed face", "beautiful eyes"],
      "composition": ["centered", "portrait"]
    },
    "negativePrompts": ["3d", "realistic", "blurry"],
    "difficulty": "beginner",
    "category": "Character"
  }
]
'@ -Encoding UTF8

Write-Host "✅ All encyclopedia JSON files created successfully!" -ForegroundColor Green
Write-Host "📁 Files created in: $path" -ForegroundColor Yellow
Write-Host "📋 Next: Run 'node validate-encyclopedia.js' to verify structure" -ForegroundColor Cyan
