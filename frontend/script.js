const API_BASE = "http://localhost:8000/api"; // ถ้า deploy แล้วเปลี่ยน URL ได้เลย

const form = document.getElementById("uploadForm");
const gallery = document.getElementById("gallery");
const message = document.getElementById("message");

// โหลดรูปทั้งหมดตอนเปิดเว็บ
window.onload = fetchImages;

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
