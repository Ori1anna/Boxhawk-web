import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(request, { params }) {
  try {
    const submissionId = params.submissionId
    const body = await request.json()
    const files = Array.isArray(body?.files) ? body.files : []

    if (!submissionId) {
      return Response.json({ error: 'submissionId is required' }, { status: 400 })
    }
    if (files.length === 0) {
      return Response.json({ error: 'files is empty' }, { status: 400 })
    }

    const rows = files.map(f => ({
      submission_id: submissionId,
      storage_path: f.path,
      size_bytes: f.size ?? null,
      mime_type: f.mime ?? null,
      width: f.width ?? null,
      height: f.height ?? null,
    }))

    const { data, error } = await supabaseAdmin
      .from('photo_submission_images')
      .insert(rows)
      .select('*')

    if (error) {
      return Response.json({ error: error.message }, { status: 400 })
    }

    // audit logs
    const logs = data.map(img => ({
      image_id: img.id,
      action: 'upload',
      to_submission_id: submissionId,
    }))
    await supabaseAdmin.from('photo_submission_image_logs').insert(logs)

    return Response.json({ images: data })
  } catch (e) {
    console.error('upload register failed', e)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}


