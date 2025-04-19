import PDFDocument from 'pdfkit'


export const createPdf = async (ticket, res, next) => {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({
            size: [600, 350],
            layout: "landscape",
            margin: 30,
        });

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `inline; filename=ticket-${ticket.departure_date}.pdf`);

        doc.pipe(res);

        // Background
        doc.rect(0, 0, 600, 350).fill("#ffffff");

        // Title section (Left)
        doc
            .fillColor("#2c3e50")
            .fontSize(22)
            .font("Helvetica-Bold")
            .text("Avtobus Chiptasi", 40, 40);

        doc
            .fontSize(12)
            .font("Helvetica")
            .fillColor("#555")
            .text(`Avtobus raqami: ${ticket.bus_number || "Noma'lum"}`, 40, 70);

        // Passenger Info
        const infoStartY = 110;
        const labelStyle = { width: 120, align: "left" };
        const valueStyle = { align: "left" };

        const info = [
            ["Ism:", ticket.passenger],
            ["Tug‘ilgan sana:", ticket.birthday],
            ["Pasport raqami:", ticket.passport],
            ["Telefon raqami:", ticket.phoneNumber],
            ["Qayerdan:", ticket.from],
            ["Qayerga:", ticket.to],
            ["O‘rindiq raqami:", ticket.seat_number],
        ];

        let y = infoStartY;

        info.forEach(([label, value]) => {
            doc
                .font("Helvetica-Bold").fillColor("#34495e").text(label, 40, y, labelStyle)
                .font("Helvetica").fillColor("#000").text(value || "Noma'lum", 170, y, valueStyle);
            y += 25;
        });

        // Footer
        doc
            .moveTo(30, 290).lineTo(570, 290).strokeColor("#bdc3c7").stroke();

        doc
            .font("Helvetica")
            .fillColor("#333")
            .fontSize(12)
            .text(`Sana: ${ticket.departure_date || '---'}`, 40, 300)
            .text(`Vaqt: ${ticket.departure_time || '---'}`, 200, 300)
            .font("Helvetica-Bold")
            .fillColor("#27ae60")
            .text(`Narxi: ${ticket.price || '0'} so'm`, 400, 300);

        doc
            .fontSize(10)
            .fillColor("gray")
            .text("Sayohatingiz yoqimli o‘tsin!", 0, 330, { align: "center" });

        doc.end();
    })
}