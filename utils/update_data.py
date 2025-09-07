import json
import os
from datetime import datetime, timedelta

# 1. Ayarlar
data_folder = "data"
# Her yeni deneme için bir tarih belirle. Bu örnekte her deneme bir gün sonra.
base_date = datetime(2024, 9, 15) # 1. Deneme tarihi
exam_names = ["5.deneme"] # Deneme isimleri

# 2. Yeni veriyi elle buraya yapıştır (Resimden okuduğunuz veri)
new_exam_data = [
    {"id": 192, "name": "Eslik, Selin Sude", "score": 75},
    {"id": 874, "name": "Esen, Berat Talha", "score": 78},
    {"id": 123, "name": "Kaya, Nizamettin", "score": 79},
    {"id": 725, "name": "Erdogdu, Zeynep", "score": 65},
    {"id": 822, "name": "Emir, Cansu", "score": 58},
    {"id": 315, "name": "Kaya, Yaren", "score": 52},
    {"id": 199, "name": "Turtur, Nisanur", "score": 50},
    {"id": 233, "name": "Karadepe, Merve", "score": 49},
    {"id": 532, "name": "Beycioglu, Ayse Sude", "score": 44},
    {"id": 326, "name": "Börklü, Kübra", "score": 31},
    {"id": 866, "name": "Türkoğlu, Ata", "score": 21},
    {"id": 476, "name": "Sarıbıyık, Gökçe", "score": 17},
    # ... Diğer öğrenciler
]

# 3. Yeni veriyi puanına göre sırala ve sıralamaları (rank) hesapla
new_exam_data_sorted = sorted(new_exam_data, key=lambda x: x['score'], reverse=True)
for rank, student in enumerate(new_exam_data_sorted, start=1):
    student['rank'] = rank
total_students = len(new_exam_data_sorted)

# 4. Mevcut JSON dosyalarını güncelle veya oluştur
print("Güncelleme Başlıyor...")
for student in new_exam_data:
    file_path = os.path.join(data_folder, f"{student['id']}.json")
    new_exam_entry = {
        "examName": exam_names[2], # 3. Deneme için index 2
        "examDate": (base_date + timedelta(days=2)).strftime("%Y-%m-%d"), # 3. Deneme için +2 gün
        "score": student['score'],
        "rank": student['rank'],
        "totalStudents": total_students
    }

    # JSON dosyası varsa oku, yoksa yeni bir tane oluştur
    if os.path.exists(file_path):
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        # Yeni deneme verisini listenin EN BAŞINA ekle (en son deneme en başta olacak)
        data['exams'].insert(0, new_exam_entry)
    else:
        # Yeni öğrenci için dosya oluştur
        print(f"Yeni öğrenci için dosya oluşturuluyor: {student['id']}.json")
        data = {
            "id": student['id'],
            "name": student['name'],
            "exams": [new_exam_entry] # İlk denemesi olarak ekle
        }
        # Önceki denemelere katılmış olabilir mi? Bu script sadece yeni veriyi ekler.

    # Dosyayı güncelle
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
        print(f"{student['id']} numaralı öğrencinin verisi güncellendi.")

print("Güncelleme Tamamlandı! Lütfen 'data' klasöründeki dosyaları GitHub'a yükleyin.")
