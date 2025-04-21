import { createClient } from '@supabase/supabase-js'
import PDFDocument from 'pdfkit'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Supabase klientini sozlash
const SUPABASE_URL = process.env.Supabase_Url
const SUPABASE_KEY = process.env.Anon_key
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

export const createPdf = async (ticket, res) => {
    try {
        // 1. Supabase storage'dan rasmni yuklab olish
        const fileName = `qr/${ticket._id}.png`
        const bucket = 'mbus_bucket'

        const { data, error } = await supabase.storage
            .from(bucket)
            .download(fileName);

        if (error) {
            throw new Error(`Faylni yuklab bo'lmadi: ${error.message}`);
        }

        // 2. Mahalliy papkaga yozish
        const imagesDir = path.join(__dirname, '../public/images');
        if (!fs.existsSync(imagesDir)) {
            fs.mkdirSync(imagesDir, { recursive: true });
        }

        const localPath = path.join(imagesDir, `${ticket._id}.png`);
        fs.writeFileSync(localPath, Buffer.from(await data.arrayBuffer()));

        const fontPath = path.join(__dirname, '../public/fonts/Roboto-VariableFont_wdth,wght.ttf')

        // 3. PDF hujjatini yaratish
        const doc = new PDFDocument({
            size: [600, 350],
            layout: 'landscape',
            margin: 30,
        })

        // PDF header sozlamalari
        res.setHeader('Content-Type', 'application/pdf')
        res.setHeader('Content-Disposition', `inline; filename=ticket-${ticket._id}.pdf`)
        doc.pipe(res)

        // Background
        doc.rect(0, 0, doc.page.width, doc.page.height).fill('#ffffff')

        // Title section
        doc
            .fillColor('#2c3e50')
            .fontSize(24)
            .font(fontPath)
            .text('Avtobus Chiptasi', 40, 40)

        doc
            .fontSize(14)
            .font(fontPath)
            .fillColor('#555')
            .text(`Avtobus raqami: ${ticket.bus_number || "Noma'lum"}`, 40, 75)

        // Passenger Info
        const infoStartY = 120
        const lineSpacing = 36  // Matnlar orasidagi masofani kattalashtirish
        const labelStyle = { width: 150, align: 'left' }
        const valueStyle = { align: 'left' }

        const info = [
            ['Ism:', ticket.passenger],
            ['Tug‘ilgan sana:', ticket.birthday],
            ['Pasport raqami:', ticket.passport],
            ['Telefon raqami:', ticket.phoneNumber],
            ['Qayerdan:', ticket.from],
            ['Qayerga:', ticket.to],
            ['O‘rindiq raqami:', ticket.seat_number],
        ]

        let y = infoStartY
        info.forEach(([label, value]) => {
            doc
                .font('Helvetica-Bold').fillColor('#34495e').fontSize(14).text(label, 40, y, labelStyle)
                .font(fontPath).fillColor('#000').fontSize(14).text(value || "Noma'lum", 190, y, valueStyle)
            y += lineSpacing
        })

        // Sana, vaqt, narx
        const textY = y + 20
        doc
            .font(fontPath)
            .fillColor('#333')
            .fontSize(14)
            .text(`Sana: ${ticket.departure_date || '---'}`, 40, textY)
            .text(`Vaqt: ${ticket.departure_time || '---'}`, 200, textY)
            .font('Helvetica-Bold')
            .fillColor('#27ae60')
            .text(`Narxi: ${ticket.price || '0'} so'm`, 400, textY)

        // QR kod va chiziqni joylash
        const qrSize = 150  // QR kod kattaligi
        const bottomMargin = 30
        const qrX = (doc.page.width - qrSize) / 2
        const qrY = doc.page.height - bottomMargin - qrSize
        const lineY = qrY - 10  // Chiziq QR kod tepasida

        // Chiziq
        doc
            .moveTo(30, lineY)
            .lineTo(doc.page.width - 30, lineY)
            .strokeColor('#bdc3c7')
            .stroke()

        // QR kod
        doc.image(localPath, qrX, qrY, {
            width: qrSize,
            height: qrSize,
        })

        
        doc.end()

        // Rasmni vaqtincha saqlangan fayldan o‘chirish
        setTimeout(() => {
            try {
                fs.unlinkSync(localPath);
                console.log(`Fayl o'chirildi: ${localPath}`);
            } catch (err) {
                console.error(`Faylni o‘chirishda xatolik: ${err.message}`);
            }
        }, 15000);

    } catch (err) {
        console.error('createPdf xatosi:', err)
    }
}