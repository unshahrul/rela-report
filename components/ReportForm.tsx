"use client"

import { useState } from "react"
import { supabase } from "../lib/supabase"

export default function ReportForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    location: "",
    type: "",
    details: "",
  })
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")

    let photoUrl = ""
    if (file) {
      const filename = `${Date.now()}-${file.name}`
      const { error: uploadError } = await supabase.storage
        .from("report-photos")
        .upload(filename, file)

      if (uploadError) {
        setLoading(false)
        setMessage("❌ Gagal upload gambar.")
        return
      }

      const { data: urlData } = supabase.storage
        .from("report-photos")
        .getPublicUrl(filename)

      photoUrl = urlData?.publicUrl || ""
    }

    const { error: insertError } = await supabase.from("reports").insert({
      ...form,
      photo_url: photoUrl,
    })

    if (insertError) {
      setLoading(false)
      setMessage("❌ Gagal simpan laporan.")
      return
    }

    await fetch("/api/send-email", {
      method: "POST",
      body: JSON.stringify({ ...form, photoUrl }),
    })

    setLoading(false)
    setMessage("✅ Laporan berjaya dihantar!")
    setForm({ name: "", email: "", location: "", type: "", details: "" })
    setFile(null)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center px-4">
      <div className="w-full max-w-xl bg-white shadow-2xl rounded-2xl p-8 space-y-5">
        <h1 className="text-2xl font-bold text-green-700 text-center">Borang Laporan RELA</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="name"
            placeholder="Nama Pelapor"
            value={form.name}
            onChange={handleChange}
            required
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
          />
          <input
            name="email"
            placeholder="Emel"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
          />
          <input
            name="location"
            placeholder="Lokasi Kejadian"
            value={form.location}
            onChange={handleChange}
            required
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
          />
          <input
            name="type"
            placeholder="Jenis Kejadian"
            value={form.type}
            onChange={handleChange}
            required
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
          />
          <textarea
            name="details"
            placeholder="Butiran Laporan"
            rows={4}
            value={form.details}
            onChange={handleChange}
            required
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
          />
          <div className="flex flex-col gap-2">
            <input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full"
            />
            {file && (
              <p className="text-sm text-gray-600 truncate">📎 {file.name}</p>
            )}
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg transition font-semibold"
          >
            {loading ? "Memproses..." : "Hantar Laporan"}
          </button>
        </form>

        {message && (
          <div className={`text-center p-3 rounded-lg font-medium ${
            message.includes("✅")
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}>
            {message}
          </div>
        )}
      </div>
    </main>
  )
}

