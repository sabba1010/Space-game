# Defense Block System - Space Invaders Game

## Overview
This document describes the pixel-based defense block system implemented for the Space Invaders game. The shields are made of a grid of small pixel squares that can be individually destroyed, creating a classic "chip away" effect.

## System Features

### 1. **Pixel Grid Structure**
- Each defensive block is composed of a **10x10 grid** of small pixel squares
- Total of **4 blocks** (one for each letter: E, N, V, O)
- Grid cells are dynamically sized based on screen resolution
- Responsive design scales block dimensions proportionally

### 2. **Block Properties**
```javascript
{
  x: number,              // Block X position
  y: number,              // Block Y position
  width: number,          // Total block width
  height: number,         // Total block height
  letter: string,         // Letter displayed (E, N, V, O)
  color: string,          // Hex color code
  cells: Array<Cell>,     // Array of individual cells
  gridCols: number,       // Number of columns (10)
  gridRows: number        // Number of rows (10)
}
```

### 3. **Cell Properties**
```javascript
{
  x: number,          // Cell X position
  y: number,          // Cell Y position
  w: number,          // Cell width
  h: number,          // Cell height
  alive: boolean,     // True if not destroyed
  row: number,        // Row index (0-9)
  col: number         // Column index (0-9)
}
```

## Collision Detection

### Player Bullets (Green)
- Fired upward from player position
- On collision with a cell:
  1. Cell is marked as `alive = false`
  2. Laser is removed from game
  3. If all cells in a block are destroyed, the entire block is removed

### Enemy Bullets (Red)
- Fired downward from enemy positions
- Support front-firing logic (only front-most enemy fires)
- On collision with a cell:
  1. Cell is marked as `alive = false`
  2. Laser is removed from game
  3. If all cells are destroyed, block is removed

### Damage System
- **Precise collision detection**: AABB (Axis-Aligned Bounding Box) method
- **Per-cell basis**: Only the specific cell hit is destroyed
- **No cascading damage**: Neighboring cells are not affected
- **Block integrity tracking**: Calculated as `livingCells / totalCells`

## Visual Rendering

### Block Drawing (`drawLetterBlock`)
1. **Background**: Rounded rectangle with block color
2. **Individual Cells**: 
   - Rendered with slight inset (0.5px) to show grid structure
   - Fill color gradually darkens as block takes damage
   - Stroke outline defines cell boundaries
3. **Letter Label**: 
   - Centered text showing block letter (E/N/V/O)
   - Black text with white shadow for visibility
   - Remains visible even when block is heavily damaged

### Color Scheme
- **E Block**: Dark Blue (`#124e78`)
- **N Block**: Cream (`#f0f0c9`)
- **V Block**: Yellow (`#f2bb05`)
- **O Block**: Orange (`#d74e09`)

### Damage Visualization
- As cells are destroyed, remaining cells get progressively darker
- Shader calculation: `shade = base_color - 15 - ((1 - integrityPercent) * 40)`
- Creates visual feedback showing damage progression

## Game Mechanics Integration

### Initialization
```javascript
createDefensiveBlocks();  // Called at game start and level reset
```

### Update Loop
- Collision detection happens in `updateLasers()`
- Rendering happens in `gameLoop()` via `drawLetterBlock()`

### Block Removal
Blocks are completely removed when:
- All 100 cells are destroyed
- Detection: `!block.cells.some(c => c.alive)`

## Responsive Design

### Screen Size Scaling
- Block width: `max(110, round(220 * screenScale.sizeFactor))`
- Block height: `max(45, round(90 * screenScale.sizeFactor))`
- Maintains 10x10 grid on all screen sizes
- Cell sizes automatically adjust to fit block dimensions

### Positioning
- Blocks centered horizontally on canvas
- Positioned near bottom of screen (`gameCanvas.height - 200`)
- Equal gap between blocks scales with screen size

## Performance Considerations

### Collision Detection Complexity
- O(n) for each laser, where n = total cells in all blocks
- Typical: 400 cells max (4 blocks × 100 cells)
- Early termination when collision found

### Rendering Optimization
- Only alive cells are drawn
- Grid-based structure enables efficient spatial queries
- Cell count reduction during gameplay reduces future overhead

## Implementation Details

### Key Functions

#### `createDefensiveBlocks()`
- Creates 4 blocks with E, N, V, O letters
- Initializes 10×10 cell grids
- Positioned at bottom of canvas

#### `drawLetterBlock(block)`
- Renders block background
- Draws all alive cells with shading
- Displays center letter label
- Applies damage visualization

#### `updateLasers()`
- Collision detection for player bullets
- Collision detection for enemy bullets
- Cell destruction and block removal logic

## Testing the System

### To Test In-Game:
1. **Player Bullets**: Shoot upward at blocks - cells should disappear individually
2. **Enemy Bullets**: Allow enemies to fire - blocks should show damage from both sides
3. **Visual Feedback**: Blocks should darken as more cells are destroyed
4. **Block Removal**: Completely destroy a block - should disappear entirely
5. **Responsive**: Test on different screen sizes - blocks should scale properly

### Expected Behavior:
- Single cell destruction per bullet hit
- No damage to neighboring cells
- Blocks remain playable until completely destroyed
- Letter label remains visible throughout
- Smooth visual progression from intact to destroyed

## Future Enhancement Ideas

1. **Variable Grid Sizes**: Different difficulties could have 5×5 (easier) to 15×15 (harder) grids
2. **Block Regeneration**: Damaged blocks could slowly regenerate between waves
3. **Shield Power-ups**: Player could collect items to repair shields
4. **Particle Effects**: Visual particles when cells are destroyed
5. **Sound Effects**: Different sounds for cell destruction vs block destruction
6. **Hitpoints**: Cells could require multiple hits to destroy
