const API_BASE = "http://localhost:8000/api"; // ถ้า deploy แล้วเปลี่ยน URL ได้เลย

const form = document.getElementById("uploadForm");
const gallery = document.getElementById("gallery");
const message = document.getElementById("message");
const lightbox = document.getElementById("lightbox");
const lightboxImage = document.getElementById("lightboxImage");
// Theme toggle
const themeToggle = document.getElementById("themeToggle");
const THEME_KEY = "theme";

// Preview elements
const imageInputEl = document.getElementById("imageInput");
const previewEl = document.getElementById("preview");
const previewImgEl = document.getElementById("previewImg");
const previewInfoEl = document.getElementById("previewInfo");
let previewObjectUrl = null;

function preferredTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === "light" || saved === "dark") return saved;
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}
function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  if (themeToggle) {
    themeToggle.textContent = theme === "light" ? "🌙 Dark" : "☀️ Light";
    themeToggle.setAttribute("aria-label", `Switch to ${theme === "light" ? "dark" : "light"} mode`);
  }
}
applyTheme(preferredTheme());

themeToggle?.addEventListener("click", () => {
  const next = document.documentElement.getAttribute("data-theme") === "light" ? "dark" : "light";
  localStorage.setItem(THEME_KEY, next);
  applyTheme(next);
});

// React to system changes if user hasn't chosen manually
window.matchMedia("(prefers-color-scheme: light)")?.addEventListener?.("change", (e) => {
  if (!localStorage.getItem(THEME_KEY)) applyTheme(e.matches ? "light" : "dark");
});

// โหลดรูปทั้งหมดตอนเปิดเว็บ
window.onload = fetchImages;

// เมื่อมีการเลือกไฟล์ แสดงตัวอย่างก่อนอัปโหลด
imageInputEl?.addEventListener("change", () => {
  const file = imageInputEl.files?.[0];
  updatePreview(file);
});

function updatePreview(file) {
  // cleanup previous object URL
  if (previewObjectUrl) {
    URL.revokeObjectURL(previewObjectUrl);
    previewObjectUrl = null;
  }
  if (!file) {
    previewImgEl.src = "";
    previewInfoEl.textContent = "";
    previewEl.classList.add("hidden");
    return;
  }
  if (!file.type?.startsWith("image/")) {
    previewImgEl.src = "";
    previewInfoEl.textContent = "ไฟล์ที่เลือกไม่ใช่รูปภาพ";
    previewEl.classList.remove("hidden");
    return;
  }
  previewObjectUrl = URL.createObjectURL(file);
  previewImgEl.src = previewObjectUrl;
  previewInfoEl.textContent = `${file.name} • ${formatBytes(file.size)}`;
  previewEl.classList.remove("hidden");
}

function formatBytes(bytes) {
  const units = ["B", "KB", "MB", "GB"];
  let i = 0, n = bytes;
  while (n >= 1024 && i < units.length - 1) { n /= 1024; i++; }
  return `${n.toFixed(n < 10 && i > 0 ? 1 : 0)} ${units[i]}`;
}

// 📤 อัปโหลดรูป
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const fileInput = document.getElementById("imageInput");
  const file = fileInput.files[0];
  if (!file) return alert("กรุณาเลือกรูปก่อนค่ะ");

  const formData = new FormData();
  formData.append("image", file);

  message.textContent = "⏳ Uploading...";

  try {
    const res = await fetch(`${API_BASE}/upload`, {
      method: "POST",
      body: formData,
    });
    const data = await res.json();

    if (res.ok) {
      message.textContent = "✅ Upload success!";
      fileInput.value = "";
      updatePreview(null); // เคลียร์พรีวิวหลังอัปโหลดสำเร็จ
      fetchImages();
    } else {
      message.textContent = `❌ Error: ${data.error || "Upload failed"}`;
    }
  } catch (err) {
    message.textContent = `⚠️ ${err.message}`;
  }
});

// 📸 ดึงรูปทั้งหมด
async function fetchImages() {
  gallery.innerHTML = "<p>Loading...</p>";
  try {
    const res = await fetch(`${API_BASE}/images`);
    const images = await res.json();
    gallery.innerHTML = "";

    images.forEach((img) => {
      const div = document.createElement("div");
      div.innerHTML = `
        <img src="${img.url}" alt="uploaded image"/>
        <br>
        <button class="delete-btn" onclick="deleteImage('${img._id}')">Delete</button>
      `;
      gallery.appendChild(div);
    });
  } catch (err) {
    gallery.innerHTML = `<p>Error loading images</p>`;
  }
}

// เปิดรูปแบบเต็มเมื่อคลิกที่รูป (ยกเว้นปุ่มลบ)
gallery.addEventListener("click", (e) => {
  if (e.target.closest(".delete-btn")) return; // ignore delete clicks
  const imgEl = e.target.closest("img");
  if (!imgEl || !gallery.contains(imgEl)) return;
  openLightbox(imgEl.src);
});

function openLightbox(src) {
  lightboxImage.src = src;
  lightbox.classList.add("open");
  lightbox.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeLightbox() {
  lightbox.classList.remove("open");
  lightbox.setAttribute("aria-hidden", "true");
  lightboxImage.src = "";
  document.body.style.overflow = "";
}

// ปิดเมื่อคลิกพื้นหลังหรือปุ่มปิด / ปิดด้วยปุ่ม Escape
lightbox.addEventListener("click", (e) => {
  if (e.target.id === "lightbox" || e.target.classList.contains("lightbox-close")) {
    closeLightbox();
  }
});

// ปิดด้วยปุ่ม Escape
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && lightbox.classList.contains("open")) {
    closeLightbox();
  }
});

// 🗑️ ลบรูป
async function deleteImage(id) {
  if (!confirm("ต้องการลบรูปนี้ไหมคะ?")) return;
  try {
    await fetch(`${API_BASE}/images/${id}`, { method: "DELETE" });
    fetchImages();
  } catch (err) {
    alert("ลบไม่สำเร็จ: " + err.message);
  }
}
