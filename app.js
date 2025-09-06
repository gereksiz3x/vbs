// URL'den öğrenci ID'sini al
const urlParams = new URLSearchParams(window.location.search);
const studentId = urlParams.get('id');

// JSON dosyasının yolunu belirle
const dataUrl = `data/${studentId}.json`;

// Chart objelerini tutmak için değişkenler
let scoreChart, rankChart;

// Sayfa yüklendiğinde veriyi çek ve işle
fetch(dataUrl)
    .then(response => {
        if (!response.ok) {
            throw new Error('Öğrenci bulunamadı veya veri yüklenemedi.');
        }
        return response.json();
    })
    .then(studentData => {
        displayStudentInfo(studentData);
        displayExamHistory(studentData);
        createCharts(studentData);
    })
    .catch(error => {
        document.getElementById('studentInfo').innerHTML = `<h2>Hata: ${error.message}</h2>`;
    });

function displayStudentInfo(data) {
    const infoDiv = document.getElementById('studentInfo');
    infoDiv.innerHTML = `
        <h2>${data.name}</h2>
        <p><strong>Öğrenci Numarası:</strong> ${data.id}</p>
        <p><strong>Toplam Katıldığı Deneme Sayısı:</strong> ${data.exams.length}</p>
    `;
}

function displayExamHistory(data) {
    const exams = data.exams;
    const tbody = document.querySelector('#examHistory tbody');
    const latestExamDiv = document.getElementById('latestExam');

    // Son denemeyi göster
    const latest = exams[0];
    let scoreChange = '';
    let rankChange = '→';

    if (exams.length > 1) {
        const previous = exams[1];
        const scoreDiff = (latest.score - previous.score).toFixed(2);
        if (scoreDiff > 0) scoreChange = `<span class="up">+${scoreDiff} ↗️</span>`;
        else if (scoreDiff < 0) scoreChange = `<span class="down">${scoreDiff} ↘️</span>`;

        const rankDiff = previous.rank - latest.rank;
        if (rankDiff > 0) rankChange = `<span class="up">${rankDiff} ↑</span>`;
        else if (rankDiff < 0) rankChange = `<span class="down">${Math.abs(rankDiff)} ↓</span>`;
    }

    latestExamDiv.innerHTML = `
        <h3>Son Deneme Performansı (${latest.examName})</h3>
        <p><strong>Aldığı Puan:</strong> ${latest.score}</p>
        <p><strong>Genel Sıralama:</strong> ${latest.rank} / ${latest.totalStudents}</p>
        <p><strong>Yorum:</strong> ${generateComment(latest, exams[1])}</p>
    `;

    // Geçmiş tablosunu doldur
    tbody.innerHTML = '';
    exams.forEach((exam, index) => {
        let puanDegisim = '-';
        let siraDegisim = '-';

        if (index < exams.length - 1) {
            const nextExam = exams[index + 1];
            const scoreDiff = (exam.score - nextExam.score).toFixed(2);
            if (scoreDiff > 0) puanDegisim = `<span class="up">+${scoreDiff} ↗️</span>`;
            else if (scoreDiff < 0) puanDegisim = `<span class="down">${scoreDiff} ↘️</span>`;

            const rankDiff = nextExam.rank - exam.rank;
            if (rankDiff > 0) siraDegisim = `<span class="up">${rankDiff} ↑</span>`;
            else if (rankDiff < 0) siraDegisim = `<span class="down">${Math.abs(rankDiff)} ↓</span>`;
            else siraDegisim = '→';
        }

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${formatDate(exam.examDate)}</td>
            <td>${exam.examName}</td>
            <td>${exam.score}</td>
            <td>${exam.rank}</td>
            <td>${exam.totalStudents}</td>
            <td>${puanDegisim}</td>
            <td>${siraDegisim}</td>
        `;
        tbody.appendChild(row);
    });
}

function generateComment(currentExam, previousExam) {
    if (!previousExam) {
        if (currentExam.rank === 1) return "İlk sırada! Mükemmel bir başarı. Bu tempoyu koruman dileğiyle.";
        return "İlk deneme sonucun. Gösterdiğin çaban için teşekkürler!";
    }

    const scoreDiff = currentExam.score - previousExam.score;
    const rankDiff = previousExam.rank - currentExam.rank; // Pozitif: iyileşme, Negatif: kötüleşme

    if (rankDiff > 0) {
        return `Sıralaman ${rankDiff} basamak yükselmiş! Harika bir ilerleme.`;
    } else if (rankDiff < 0) {
        return `Sıralaman ${Math.abs(rankDiff)} basamak düşmüş. Bir sonraki deneme için daha fazla çalışmalısın.`;
    } else {
        if (scoreDiff > 0) return "Sıralaman koruyarak puanını artırmayı başardın! Tebrikler.";
        return "Sıralaman aynı kalmış. Küçük bir push ile sıralamanı yükseltebilirsin.";
    }
}

function formatDate(dateString) {
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('tr-TR', options);
}

function createCharts(data) {
    const exams = data.exams.slice().reverse(); // Tarih sırasına göre çizmesi için ters çevir
    const labels = exams.map(e => e.examName);
    const scores = exams.map(e => e.score);
    const ranks = exams.map(e => e.rank);

    // Puan Grafiği
    const scoreCtx = document.getElementById('scoreChart').getContext('2d');
    scoreChart = new Chart(scoreCtx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Puan',
                data: scores,
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: { display: true, text: 'Puan Değişimi' }
            },
            scales: {
                y: { beginAtZero: false }
            }
        }
    });

    // Sıralama Grafiği (düşük sayı iyi olduğu için ters çeviririz)
    const rankCtx = document.getElementById('rankChart').getContext('2d');
    rankChart = new Chart(rankCtx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Sıralama',
                data: ranks,
                borderColor: 'rgb(255, 99, 132)',
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: { display: true, text: 'Sıralama Değişimi (Küçük Sayı Daha İyi)' }
            },
            scales: {
                y: { reverse: true } // Sıralama grafiğini ters çevir
            }
        }
    });
}
