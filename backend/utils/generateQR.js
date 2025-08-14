/**
 * Thai QR / EMV MPM builder (Tag 30 – Merchant/Biller ID) + Additional Data (Tag 62)
 * - Reference format: YYYYMMDD + UnixSeconds + Amount + KeyAPI
 * - CRC16-CCITT (False) polynomial 0x1021, init 0xFFFF
 * This is a minimal builder that complies with Thai QR/EMV TLV basics.
 * Apps in Thailand can scan/pay when merchant/biller ID is valid with acquirer.
 */
import QRCode from 'qrcode';

function tlv(id, value) {
  const len = value.length.toString().padStart(2, '0');
  return `${id}${len}${value}`;
}

function crc16ccitt(input) {
  // CCITT-FALSE: poly 0x1021, init 0xFFFF, no xorout
  let crc = 0xFFFF;
  for (let i = 0; i < input.length; i++) {
    crc ^= input.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if (crc & 0x8000) crc = (crc << 1) ^ 0x1021;
      else crc <<= 1;
      crc &= 0xFFFF;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

/**
 * Build EMV payload
 * @param {Object} p
 * @param {string} p.merchantId - Biller/Merchant ID (Thai QR Tag 30)
 * @param {number} p.amount - THB amount
 * @param {string} p.ref - reference string for Additional Data (Tag 62, 01=Bill, 05=Ref)
 */
export function buildEmvPayload({ merchantId, amount, ref }) {
  // Payload Format Indicator + Dynamic
  const pfi = tlv('00', '01'); // 01
  const poiMethod = tlv('01', '12'); // 12 = dynamic, can be 11 static

  // Merchant Account Information – Domestic scheme (Tag 30)
  // For Thai QR: Tag 30 holds Biller/Merchant ID under sub-tags, but in simplified form,
  // many acquirers accept 'merchantId' as one string. If your acquirer requires sub-TLVs,
  // adapt here (e.g., AID/GUI + ID fields).
  const mai30 = tlv('30', tlv('00', 'A000000677010112') + tlv('01', merchantId));

  // Country & Currency
  const txnCurrency = tlv('53', '764'); // THB=764 (ISO 4217)
  const txnAmount = tlv('54', amount.toFixed(2));
  const countryCode = tlv('58', 'TH');
  const merchantName = tlv('59', 'MERCHANT');
  const merchantCity = tlv('60', 'BANGKOK');

  // Additional Data Field Template (Tag 62): Bill Number (01) + Reference (05)
  const addl = tlv('62', tlv('01', ref.slice(0, 25)) + tlv('05', ref.slice(-25)));

  // CRC placeholder (Tag 63)
  const partial = pfi + poiMethod + mai30 + txnCurrency + txnAmount + countryCode + merchantName + merchantCity + addl + '6304';
  const crc = crc16ccitt(partial);
  return partial + crc;
}

/**
 * Generate reference string: YYYYMMDD + UnixSeconds + Amount + APIKEY
 */
export function buildReference({ amount, apiKey }) {
  const now = new Date();
  const y = now.getFullYear().toString();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const datePart = `${y}${m}${d}`;
  const unix = Math.floor(now.getTime() / 1000);
  const amt = Number(amount).toFixed(2).replace('.', '');
  return `${datePart}${unix}${amt}${apiKey}`;
}

/**
 * Generate QR (data URL) from payload
 */
export async function toQrDataUrl(payload) {
  return QRCode.toDataURL(payload, { errorCorrectionLevel: 'M', margin: 1, scale: 6 });
}
