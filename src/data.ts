import { User, Room, Transaction, Maintenance, AuditLog, WorkSession, QcInspection, BreakfastMenuItem, BreakfastOrder, Building, MeetingRoom, RoomCapacityRate } from './types';
import { getRealTodayDate, normalizeBuildingName } from './lib/utils';
import { officialHistoricalTransactions } from './initialTransactionsData';

export const OFFICIAL_TARIFFS: Record<string, any> = {
    "Gedung A (Arafah)": { category: "KAMAR", capacity: "Superior & Standar (Double / 2-4 Single Bed)", desc: "Superior & Standar Arafah" },
    "Gedung B (Muzdalifah)": { category: "KAMAR", capacity: "Standar (2-6 Single Bed)", desc: "Standar Muzdalifah" },
    "Gedung C (Mina)": { category: "KAMAR", capacity: "Standar & Ekonomi (4-8 Single Bed)", desc: "Standar & Barak Mina" },
    "Gedung D (Madinah)": { category: "KAMAR", capacity: "Superior (Double & 2-4 Single Bed AC/TV)", desc: "Superior Deluxe Madinah" },
    "Ruang Pertemuan": { category: "AULA", capacity: "100 - 1500 Orang", desc: "Sewa per Hari / Acara" },
    "Ruang Pertemuan / Aula": { category: "AULA", capacity: "100 - 1500 Orang", desc: "Sewa per Hari / Acara" }
};

// Master Katalog Kapasitas & Tarif Kamar (Dikosongkan sesuai permintaan pengguna)
export const initialRoomCapacityRates: RoomCapacityRate[] = [];

// Helper untuk menemukan tarif kapasitas default
export function findRoomRate(
    roomType: string = 'Standar', 
    bedType: string = '4 Single Bed',
    customRates: RoomCapacityRate[] = initialRoomCapacityRates
): RoomCapacityRate | undefined {
    return customRates.find(r => 
        r.roomType.toLowerCase() === roomType.toLowerCase() && 
        r.bedType.toLowerCase() === bedType.toLowerCase()
    );
}

// Master Users: Akun Resmi Petugas Terpadu SIM-HAJI UPT Asrama Haji Jakarta
// Hanya mengecualikan Super Admin (Administrator Management) dan Admin (Administrator Operasional)
export const initialUsers: User[] = [
    { 
        id: 'u-superadmin', 
        username: 'superadmin', 
        fullName: 'Administrator Management', 
        role: 'Super Admin', 
        password: '12345',
        department: 'Pimpinan & IT UPT',
        supervisorId: null,
        assignedBuilding: 'Semua Gedung', 
        phone: '081211112222', 
        status: 'Aktif',
        isOwner: true
    },
    { 
        id: 'u-admin', 
        username: 'admin', 
        fullName: 'Administrator Operasional', 
        role: 'Admin', 
        password: '12345',
        department: 'Administrasi & Pelayanan UPT',
        supervisorId: 'u-superadmin',
        assignedBuilding: 'Semua Gedung', 
        phone: '081233334444', 
        status: 'Aktif',
        isOwner: false
    }
];

// Master Gedung (Buildings) dikosongkan sesuai permintaan pembersihan database
export const initialBuildings: Building[] = [];

// Master Ruang Pertemuan (Meeting Rooms / Aula) dikosongkan
export const initialMeetingRooms: MeetingRoom[] = [];

// Generator master kamar bersih (Dikosongkan)
export function getCleanRooms(): Room[] {
    return [];
}

// Initial rooms (Dikosongkan)
export function getInitialRooms(): Room[] {
    return [];
}

// Data Transaksi Resmi Hunian Kamar & Reservasi (Dikosongkan)
export const initialTransactions: Transaction[] = [];
export const initialMaintenances: Maintenance[] = [];
export const initialQcInspections: QcInspection[] = [];
export const initialWorkSessions: WorkSession[] = [];

// Master Menu Sarapan Resmi Koperasi UPT (Dikosongkan)
export const initialBreakfastMenuItems: BreakfastMenuItem[] = [];

// Inisialisasi pesanan sarapan bersih (Dikosongkan)
export function getInitialBreakfastOrders(_txList: Transaction[] = initialTransactions): BreakfastOrder[] {
    return [];
}

// Log inisialisasi sistem default (Dikosongkan)
export const initialAuditLogs: AuditLog[] = [];

// =========================================================================
// KONFIGURASI RESMI PENERIMAAN PNBP & BANK TRANSFER INDONESIA
// =========================================================================
export const OFFICIAL_VA_CONFIG = {
  vaNumber: '8101626953822901',
  accountName: 'Rpl 133 Ps Ahkl1 Jkt',
  bankName: 'Bank Syariah Indonesia (BSI) / Bank Mandiri (VA UPT Asrama Haji Jakarta)'
};

export const INDONESIAN_BANKS = [
  'Bank Mandiri',
  'Bank Syariah Indonesia (BSI)',
  'Bank BRI (Bank Rakyat Indonesia)',
  'Bank BNI (Bank Negara Indonesia)',
  'Bank BCA (Bank Central Asia)',
  'Bank DKI',
  'Bank BTN (Bank Tabungan Negara)',
  'Bank CIMB Niaga',
  'Bank Permata',
  'Bank Danamon',
  'Bank Mega',
  'Bank BJB (Bank Jawa Barat)',
  'Bank Jateng',
  'Bank Jatim',
  'Bank Muamalat',
  'Bank Sinarmas',
  'Bank Lainnya'
];
