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
      const { data, error } = await supabase.storage
        .from("report-photos")
        .upload(filename, file)

      if (error) {
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
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-white rounded-xl shadow max-w-xl mx-auto mt-8">
      <h2 className="text-xl font-bold">Borang Laporan RELA</h2>
      <input name="name" placeholder="Nama" value={form.name} onChange={handleChange} required className="w-full p-2 border rounded" />
      <input name="email" placeholder="Emel" value={form.email} onChange={handleChange} required className="w-full p-2 border rounded" />
      <input name="location" placeholder="Lokasi Kejadian" value={form.location} onChange={handleChange} required className="w-full p-2 border rounded" />
      <input name="type" placeholder="Jenis Kejadian" value={form.type} onChange={handleChange} required className="w-full p-2 border rounded" />
      <textarea name="details" placeholder="Butiran Laporan" value={form.details} onChange={handleChange} required className="w-full p-2 border rounded" rows={4} />
      <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} className="w-full" />
      <button type="submit" disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
        {loading ? "Memproses..." : "Hantar Laporan"}
      </button>
      {message && <p className="mt-2 text-sm">{message}</p>}
    </form>
  )
}