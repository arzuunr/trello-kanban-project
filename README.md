# TaskFlow: Modern ve Fütüristik Kanban Yönetim Sistemi

## Proje Hakkında
TaskFlow; Next.js 14, Supabase ve dnd-kit teknolojilerini kullanarak, iş akışlarını fütüristik bir kullanıcı deneyimi ile modernize etmeyi amaçlayan bir SaaS platformudur.

## Temel Özellikler
*   **Modern SaaS Arayüzü:** Derin siyah ve mor tonların hakim olduğu, minimalist ve profesyonel bir görsel dil benimsenmiştir.
*   **Gelişmiş Sürükle ve Bırak:** dnd-kit kütüphanesi kullanılarak hem sütunlar hem de kartlar bazında akıcı bir sıralama mekanizması kurulmuştur.
*   **Klavye Odaklı Kullanıcı Deneyimi:** Yeni sütun veya görev ekleme süreçlerinde fare kullanımına gerek kalmadan, Enter tuşu ile onaylama ve Escape tuşu ile iptal işlemleri gerçekleştirilebilir.
*   **Veri Kalıcılığı ve Senkronizasyon:** Supabase PostgreSQL entegrasyonu sayesinde her bir sürükleme hareketi ve içerik değişikliği veritabanı seviyesinde eş zamanlı olarak korunur.
*   **Dinamik Sıralama Sistemi:** Projeler ve görevler, veritabanındaki pozisyon değerlerine göre akıllıca sıralanır ve her oturumda aynı düzende sunulur.

## Kullanılan Teknolojiler
*   **Frontend:** Next.js 14 (App Router)
*   **Backend:** Supabase (PostgreSQL, Auth ve Row Level Security)
*   **Sürükle-Bırak Mantığı:** @dnd-kit/core ve @dnd-kit/sortable
*   **Dil:** TypeScript
*   **Dağıtım:** Vercel

## Kurulum ve Çalıştırma
Projeyi yerel ortamınızda ayağa kaldırmak için aşağıdaki adımları takip edebilirsiniz:

1.  **Depoyu Klonlayın:**
    ```bash
    git clone https://github.com/arzuunr/trello-kanban-project.git
    ```
2.  **Bağımlılıkları Yükleyin:**
    ```bash
    npm install
    ```
3.  **Çevre Değişkenlerini Ayarlayın:**
    `.env.local` dosyası oluşturarak Supabase bağlantı bilgilerinizi tanımlayın:
    ```env
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
    ```
4.  **Uygulamayı Başlatın:**
    ```bash
    npm run dev
    ```
