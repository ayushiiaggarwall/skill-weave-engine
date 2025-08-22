import { useEffect, useState } from "react"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Lock, Unlock, Plus } from "lucide-react"

interface Course { id: string; title: string }
interface CertificateRow {
  id: string
  title: string
  description: string | null
  certificate_url: string | null
  course_id: string
  is_locked: boolean
  courses?: { title?: string | null } | null
}

export default function CertificatesManagement() {
  const { toast } = useToast()
  const [courses, setCourses] = useState<Course[]>([])
  const [certificates, setCertificates] = useState<CertificateRow[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({
    title: "",
    description: "",
    course_id: "",
    certificate_url: "",
    is_locked: true,
  })

useEffect(() => {
  const fetchAll = async () => {
    try {
      const [{ data: coursesData }, { data: certsData }] = await Promise.all([
        supabase.from('courses').select('id, title').order('created_at', { ascending: true }),
        supabase.from('certificates').select(`
          id, title, description, certificate_url, course_id, is_locked,
          courses ( title )
        `).order('created_at', { ascending: false })
      ])
      setCourses((coursesData as Course[]) || [])
      setCertificates((certsData as CertificateRow[]) || [])
    } catch (e) {
      console.error('Error loading certificates admin:', e)
      toast({ title: 'Error', description: 'Failed to load data', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }
  fetchAll()

  const channel = supabase
    .channel('admin-certificates')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'certificates' }, async () => {
      const { data } = await supabase.from('certificates').select(`
        id, title, description, certificate_url, course_id, is_locked,
        courses ( title )
      `).order('created_at', { ascending: false })
      setCertificates((data as CertificateRow[]) || [])
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'courses' }, async () => {
      const { data } = await supabase.from('courses').select('id, title').order('created_at', { ascending: true })
      setCourses((data as Course[]) || [])
    })
    .subscribe()
  return () => { supabase.removeChannel(channel) }
}, [])

  const createCertificate = async () => {
    if (!form.title.trim() || !form.course_id) {
      toast({ title: 'Missing info', description: 'Title and Course are required', variant: 'destructive' })
      return
    }
    setSaving(true)
    try {
      const { error } = await supabase.from('certificates').insert([{
        title: form.title.trim(),
        description: form.description?.trim() || null,
        course_id: form.course_id,
        certificate_url: form.certificate_url?.trim() || null,
        is_locked: form.is_locked,
      }])
      if (error) throw error
      toast({ title: 'Created', description: 'Certificate created' })
      setForm({ title: '', description: '', course_id: '', certificate_url: '', is_locked: true })
    } catch (e) {
      console.error(e)
      toast({ title: 'Error', description: 'Could not create certificate', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  const toggleLock = async (cert: CertificateRow) => {
    try {
      const { error } = await supabase
        .from('certificates')
        .update({ is_locked: !cert.is_locked })
        .eq('id', cert.id)
      if (error) throw error
      toast({ title: !cert.is_locked ? 'Locked' : 'Unlocked', description: `${cert.title}` })
    } catch (e) {
      console.error(e)
      toast({ title: 'Error', description: 'Update failed', variant: 'destructive' })
    }
  }

  const updateUrl = async (id: string, certificate_url: string) => {
    try {
      const { error } = await supabase
        .from('certificates')
        .update({ certificate_url: certificate_url || null })
        .eq('id', id)
      if (error) throw error
      toast({ title: 'Saved', description: 'Certificate URL updated' })
    } catch (e) {
      console.error(e)
      toast({ title: 'Error', description: 'Could not update URL', variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-8">
      <Card className="pt-4">
        <CardHeader>
          <CardTitle>Create Certificate</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm">Title</label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className="space-y-2">
              <label className="text-sm">Course</label>
              <Select value={form.course_id} onValueChange={(v) => setForm({ ...form, course_id: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select course" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm">Description</label>
              <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm">Certificate URL (optional)</label>
              <Input value={form.certificate_url} onChange={(e) => setForm({ ...form, certificate_url: e.target.value })} placeholder="https://...pdf" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant={form.is_locked ? 'secondary' : 'default'} type="button" onClick={() => setForm({ ...form, is_locked: !form.is_locked })}>
              {form.is_locked ? <Lock className="h-4 w-4 mr-2" /> : <Unlock className="h-4 w-4 mr-2" />}
              {form.is_locked ? 'Locked' : 'Unlocked'}
            </Button>
            <Button onClick={createCertificate} disabled={saving}>
              <Plus className="h-4 w-4 mr-2" /> Create
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="pt-4">
        <CardHeader>
          <CardTitle>Certificates ({certificates.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading ? (
            <div className="py-8 text-center text-muted-foreground">Loading...</div>
          ) : certificates.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">No certificates yet</div>
          ) : (
            certificates.map((cert) => (
              <div key={cert.id} className="p-4 border rounded-lg flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <div className="font-medium">{cert.title}</div>
                    <Badge variant={cert.is_locked ? 'outline' : 'default'}>
                      {cert.is_locked ? 'Locked' : 'Unlocked'}
                    </Badge>
                  </div>
                  {cert.courses?.title && (
                    <div className="text-xs text-muted-foreground">Course: {cert.courses.title}</div>
                  )}
                  {cert.description && (
                    <div className="text-sm text-muted-foreground mt-1">{cert.description}</div>
                  )}
                  <div className="mt-3">
                    <label className="text-xs">Certificate URL</label>
                    <Input
                      className="mt-1"
                      placeholder="https://...pdf"
                      defaultValue={cert.certificate_url || ''}
                      onBlur={(e) => updateUrl(cert.id, e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={() => toggleLock(cert)}>
                    {cert.is_locked ? <Unlock className="h-4 w-4 mr-2" /> : <Lock className="h-4 w-4 mr-2" />}
                    {cert.is_locked ? 'Unlock' : 'Lock'}
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
