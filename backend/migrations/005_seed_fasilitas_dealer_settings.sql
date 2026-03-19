-- Migration: seed default fasilitas dealer settings into settings table

INSERT INTO settings (`key`, value_json)
VALUES (
  'fasilitas_dealer',
  JSON_OBJECT(
    'items',
    JSON_ARRAY(
      JSON_OBJECT(
        'key', 'fasilitas',
        'label', 'Fasilitas',
        'description',
        'Area servis dan bengkel resmi BYD dengan teknisi terlatih dan peralatan lengkap untuk perawatan kendaraan listrik Anda.',
        'imageUrl', NULL
      ),
      JSON_OBJECT(
        'key', 'waiting',
        'label', 'Waiting Room',
        'description',
        'Ruang tunggu nyaman dengan fasilitas lengkap sambil menunggu kendaraan Anda diservis.',
        'imageUrl', NULL
      ),
      JSON_OBJECT(
        'key', 'charger',
        'label', 'Wall Charger',
        'description',
        'Stasiun pengisian daya untuk kendaraan listrik BYD, tersedia di area dealer untuk kebutuhan charging Anda.',
        'imageUrl', NULL
      )
    )
  )
)
ON DUPLICATE KEY UPDATE value_json = value_json;

