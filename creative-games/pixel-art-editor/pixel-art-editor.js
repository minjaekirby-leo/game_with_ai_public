// 캔버스 설정
const canvas = document.getElementById('pixelCanvas');
const ctx = canvas.getContext('2d');
const gridSize = 16;
const pixelSize = canvas.width / gridSize;

// 게임 상태
let currentTool = 'paint';
let currentColor = '#000000';
let brushSize = 1;
let isDrawing = false;
let pixelGrid = [];
let gallery = JSON.parse(localStorage.getItem('pixelArtGallery')) || [];

// 색상 팔레트
const colors = [
    '#000000', '#FFFFFF', '#FF0000', '#00FF00',
    '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF',
    '#800000', '#008000', '#000080', '#808000',
    '#800080', '#008080', '#C0C0C0', '#808080',
    '#FFA500', '#FFC0CB', '#A52A2A', '#DDA0DD',
    '#98FB98', '#F0E68C', '#DEB887', '#D2691E'
];

// 픽셀 그리드 초기화
function initPixelGrid() {
    pixelGrid = [];
    for (let y = 0; y < gridSize; y++) {
        pixelGrid[y] = [];
        for (let x = 0; x < gridSize; x++) {
            pixelGrid[y][x] = '#FFFFFF';
        }
    }
}

// 색상 팔레트 생성
function createColorPalette() {
    const palette = document.getElementById('colorPalette');
    palette.innerHTML = '';
    
    colors.forEach(color => {
        const colorBtn = document.createElement('div');
        colorBtn.className = 'color-btn';
        colorBtn.style.backgroundColor = color;
        colorBtn.onclick = () => selectColor(color);
        
        if (color === currentColor) {
            colorBtn.classList.add('selected');
        }
        
        palette.appendChild(colorBtn);
    });
}

// 색상 선택
function selectColor(color) {
    currentColor = color;
    document.querySelectorAll('.color-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    event.target.classList.add('selected');
}

// 도구 선택
function selectTool(tool) {
    currentTool = tool;
    document.querySelectorAll('.tool-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.getElementById(tool + 'Tool').classList.add('active');
    
    // 커서 변경
    if (tool === 'paint') {
        canvas.style.cursor = 'crosshair';
    } else if (tool === 'erase') {
        canvas.style.cursor = 'grab';
    } else if (tool === 'fill') {
        canvas.style.cursor = 'pointer';
    } else if (tool === 'eyedrop') {
        canvas.style.cursor = 'copy';
    }
}

// 캔버스 그리기
function drawCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 픽셀 그리기
    for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
            ctx.fillStyle = pixelGrid[y][x];
            ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
        }
    }
    
    // 그리드 선 그리기
    ctx.strokeStyle = '#CCCCCC';
    ctx.lineWidth = 1;
    
    for (let i = 0; i <= gridSize; i++) {
        ctx.beginPath();
        ctx.moveTo(i * pixelSize, 0);
        ctx.lineTo(i * pixelSize, canvas.height);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(0, i * pixelSize);
        ctx.lineTo(canvas.width, i * pixelSize);
        ctx.stroke();
    }
}

// 픽셀 그리기
function drawPixel(x, y) {
    if (x < 0 || x >= gridSize || y < 0 || y >= gridSize) return;
    
    if (currentTool === 'paint') {
        // 브러시 크기에 따라 여러 픽셀 그리기
        for (let dy = 0; dy < brushSize; dy++) {
            for (let dx = 0; dx < brushSize; dx++) {
                const newX = x + dx;
                const newY = y + dy;
                if (newX < gridSize && newY < gridSize) {
                    pixelGrid[newY][newX] = currentColor;
                }
            }
        }
    } else if (currentTool === 'erase') {
        for (let dy = 0; dy < brushSize; dy++) {
            for (let dx = 0; dx < brushSize; dx++) {
                const newX = x + dx;
                const newY = y + dy;
                if (newX < gridSize && newY < gridSize) {
                    pixelGrid[newY][newX] = '#FFFFFF';
                }
            }
        }
    } else if (currentTool === 'fill') {
        floodFill(x, y, pixelGrid[y][x], currentColor);
    } else if (currentTool === 'eyedrop') {
        currentColor = pixelGrid[y][x];
        selectColor(currentColor);
    }
    
    drawCanvas();
}

// 채우기 도구 (Flood Fill)
function floodFill(x, y, targetColor, fillColor) {
    if (targetColor === fillColor) return;
    if (x < 0 || x >= gridSize || y < 0 || y >= gridSize) return;
    if (pixelGrid[y][x] !== targetColor) return;
    
    pixelGrid[y][x] = fillColor;
    
    // 4방향으로 재귀 호출
    floodFill(x + 1, y, targetColor, fillColor);
    floodFill(x - 1, y, targetColor, fillColor);
    floodFill(x, y + 1, targetColor, fillColor);
    floodFill(x, y - 1, targetColor, fillColor);
}

// 마우스 이벤트
canvas.addEventListener('mousedown', (e) => {
    isDrawing = true;
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / pixelSize);
    const y = Math.floor((e.clientY - rect.top) / pixelSize);
    drawPixel(x, y);
});

canvas.addEventListener('mousemove', (e) => {
    if (!isDrawing) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / pixelSize);
    const y = Math.floor((e.clientY - rect.top) / pixelSize);
    
    if (currentTool === 'paint' || currentTool === 'erase') {
        drawPixel(x, y);
    }
});

canvas.addEventListener('mouseup', () => {
    isDrawing = false;
});

// 브러시 크기 조절
document.getElementById('brushSize').addEventListener('input', (e) => {
    brushSize = parseInt(e.target.value);
    document.getElementById('brushSizeDisplay').textContent = brushSize + 'px';
});

// 캔버스 지우기
function clearCanvas() {
    if (confirm('정말로 모든 내용을 지우시겠습니까?')) {
        initPixelGrid();
        drawCanvas();
    }
}

// 갤러리에 저장
function saveToGallery() {
    const imageData = canvas.toDataURL();
    const artwork = {
        id: Date.now(),
        data: imageData,
        grid: JSON.parse(JSON.stringify(pixelGrid)),
        timestamp: new Date().toLocaleString(),
        pixelCount: countNonWhitePixels(),
        colorsUsed: countUniqueColors()
    };
    
    gallery.push(artwork);
    localStorage.setItem('pixelArtGallery', JSON.stringify(gallery));
    
    updateGalleryDisplay();
    updateStats();
    
    alert('작품이 갤러리에 저장되었습니다!');
}

// 흰색이 아닌 픽셀 개수 세기
function countNonWhitePixels() {
    let count = 0;
    for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
            if (pixelGrid[y][x] !== '#FFFFFF') {
                count++;
            }
        }
    }
    return count;
}

// 사용된 색상 개수 세기
function countUniqueColors() {
    const uniqueColors = new Set();
    for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
            if (pixelGrid[y][x] !== '#FFFFFF') {
                uniqueColors.add(pixelGrid[y][x]);
            }
        }
    }
    return uniqueColors.size;
}

// 갤러리 표시 업데이트
function updateGalleryDisplay() {
    const galleryElement = document.getElementById('gallery');
    galleryElement.innerHTML = '';
    
    gallery.forEach((artwork, index) => {
        const galleryItem = document.createElement('div');
        galleryItem.className = 'gallery-item';
        
        const img = document.createElement('img');
        img.src = artwork.data;
        img.className = 'gallery-canvas';
        img.onclick = () => loadArtwork(index);
        
        const info = document.createElement('div');
        info.style.fontSize = '0.8rem';
        info.style.color = '#333';
        info.style.marginTop = '5px';
        info.innerHTML = `
            <div>픽셀: ${artwork.pixelCount}</div>
            <div>색상: ${artwork.colorsUsed}</div>
        `;
        
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = '🗑️';
        deleteBtn.style.fontSize = '0.8rem';
        deleteBtn.style.padding = '2px 6px';
        deleteBtn.style.marginTop = '5px';
        deleteBtn.onclick = (e) => {
            e.stopPropagation();
            deleteArtwork(index);
        };
        
        galleryItem.appendChild(img);
        galleryItem.appendChild(info);
        galleryItem.appendChild(deleteBtn);
        galleryElement.appendChild(galleryItem);
    });
}

// 작품 불러오기
function loadArtwork(index) {
    if (confirm('현재 작업을 덮어쓰시겠습니까?')) {
        pixelGrid = JSON.parse(JSON.stringify(gallery[index].grid));
        drawCanvas();
    }
}

// 작품 삭제
function deleteArtwork(index) {
    if (confirm('이 작품을 삭제하시겠습니까?')) {
        gallery.splice(index, 1);
        localStorage.setItem('pixelArtGallery', JSON.stringify(gallery));
        updateGalleryDisplay();
        updateStats();
    }
}

// 통계 업데이트
function updateStats() {
    document.getElementById('artworkCount').textContent = gallery.length;
    
    let totalPixels = 0;
    let allColors = new Set();
    
    gallery.forEach(artwork => {
        totalPixels += artwork.pixelCount;
        artwork.grid.forEach(row => {
            row.forEach(color => {
                if (color !== '#FFFFFF') {
                    allColors.add(color);
                }
            });
        });
    });
    
    document.getElementById('totalPixels').textContent = totalPixels;
    document.getElementById('colorsUsed').textContent = allColors.size;
}

// 템플릿 불러오기
function loadTemplate() {
    const templates = [
        // 하트
        [
            '0000000000000000',
            '0000110001100000',
            '0001111011110000',
            '0011111111111000',
            '0011111111111000',
            '0001111111110000',
            '0000111111100000',
            '0000011111000000',
            '0000001110000000',
            '0000000100000000',
            '0000000000000000',
            '0000000000000000',
            '0000000000000000',
            '0000000000000000',
            '0000000000000000',
            '0000000000000000'
        ],
        // 별
        [
            '0000000000000000',
            '0000000110000000',
            '0000000110000000',
            '0000001111000000',
            '0001111111110000',
            '0000111111100000',
            '0001111111110000',
            '0011111111111000',
            '0001111111110000',
            '0000111111100000',
            '0000011111000000',
            '0000001110000000',
            '0000000000000000',
            '0000000000000000',
            '0000000000000000',
            '0000000000000000'
        ]
    ];
    
    const template = templates[Math.floor(Math.random() * templates.length)];
    
    for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
            if (template[y] && template[y][x] === '1') {
                pixelGrid[y][x] = currentColor;
            } else {
                pixelGrid[y][x] = '#FFFFFF';
            }
        }
    }
    
    drawCanvas();
}

// 이미지 내보내기
function exportImage() {
    const link = document.createElement('a');
    link.download = 'pixel-art-' + Date.now() + '.png';
    link.href = canvas.toDataURL();
    link.click();
}

// 갤러리 비우기
function clearGallery() {
    if (confirm('모든 작품을 삭제하시겠습니까?')) {
        gallery = [];
        localStorage.setItem('pixelArtGallery', JSON.stringify(gallery));
        updateGalleryDisplay();
        updateStats();
    }
}

// 픽셀 아트 챌린지 게임
function startPixelGame() {
    const challenges = [
        { name: '집', description: '집을 그려보세요!' },
        { name: '나무', description: '나무를 그려보세요!' },
        { name: '자동차', description: '자동차를 그려보세요!' },
        { name: '꽃', description: '꽃을 그려보세요!' },
        { name: '동물', description: '좋아하는 동물을 그려보세요!' }
    ];
    
    const challenge = challenges[Math.floor(Math.random() * challenges.length)];
    
    if (confirm(`픽셀 아트 챌린지!\n\n주제: ${challenge.name}\n${challenge.description}\n\n도전하시겠습니까?`)) {
        clearCanvas();
        alert(`주제: ${challenge.name}\n시간 제한은 없으니 천천히 그려보세요!`);
    }
}

// 초기화
function init() {
    initPixelGrid();
    createColorPalette();
    drawCanvas();
    updateGalleryDisplay();
    updateStats();
    
    // 기본 색상 선택
    selectColor('#000000');
}

// 페이지 로드 시 초기화
window.addEventListener('load', init);