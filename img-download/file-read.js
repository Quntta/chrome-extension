document.getElementById('fileInput').addEventListener('change', handleFileSelect);
function handleFileSelect(event) {
  const files = Array.from(event.target.files); // 将 FileList 转换为数组
  const sortedFiles = files
    .filter(file => file.type.startsWith('image/')) // 过滤出图片文件
    .sort((a, b) => extractNumber(a.name) - extractNumber(b.name)); // 按数字大小排序

  for (const file of sortedFiles) {
    const img = document.createElement('img');
    img.src = URL.createObjectURL(file); // 使用 URL.createObjectURL
    img.className = 'img-preview';
    img.alt = file.name; // 设置 alt 属性为文件名
    document.getElementById('content').appendChild(img);
  }
}

// 提取文件名中被 "sort-" 包裹的数字部分
function extractNumber(filename) {
  const match = filename.match(/sort-(\d+)/); // 匹配 "sort-" 和数字
  return match ? parseInt(match[1], 10) : 0; // 如果有数字，返回其数值；否则返回 0
}