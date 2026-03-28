// 증거 파일 관리 유틸리티
// expo-file-system v19+ (new API: File, Directory, Paths)

import { File, Directory, Paths } from 'expo-file-system';

const EVIDENCE_DIR_NAME = 'evidence';

/**
 * 증거 디렉토리 가져오기 (없으면 생성)
 */
export function ensureEvidenceDir(): Directory {
  const dir = new Directory(Paths.document, EVIDENCE_DIR_NAME);
  if (!dir.exists) {
    dir.create({ intermediates: true });
  }
  return dir;
}

/**
 * 파일을 증거 디렉토리로 복사 (원본 URI -> 영구 저장소)
 * @param sourceUri 원본 파일 URI (picker에서 받은 임시 경로)
 * @param filename 저장할 파일명
 * @returns 저장된 파일의 URI
 */
export function saveEvidenceFile(sourceUri: string, filename: string): string {
  const dir = ensureEvidenceDir();
  const sourceFile = new File(sourceUri);
  const destFile = new File(dir, filename);

  // 이미 같은 이름의 파일이 있으면 삭제
  if (destFile.exists) {
    destFile.delete();
  }

  sourceFile.copy(destFile);
  return destFile.uri;
}

/**
 * 파일을 base64로 읽기 (AI API 전송용)
 * @param fileUri 파일 URI
 * @returns base64 인코딩된 문자열
 */
export async function readFileAsBase64(fileUri: string): Promise<string> {
  const file = new File(fileUri);
  return await file.base64();
}

/**
 * 파일 삭제
 * @param fileUri 삭제할 파일 URI
 */
export function deleteEvidenceFile(fileUri: string): void {
  const file = new File(fileUri);
  if (file.exists) {
    file.delete();
  }
}

/**
 * 파일 크기 확인 (bytes)
 * @param fileUri 파일 URI
 * @returns 파일 크기 (bytes), 파일이 없으면 0
 */
export function getFileSize(fileUri: string): number {
  const file = new File(fileUri);
  return file.size ?? 0;
}

/**
 * 타임스탬프 기반 파일명 생성
 * @param type 파일 유형 ('image' | 'audio' | 'file')
 * @param extension 파일 확장자 (예: 'jpg', 'mp3', 'pdf')
 * @returns 생성된 파일명 (예: 'evidence-image-20260328-143215.jpg')
 */
export function generateFilename(type: 'image' | 'audio' | 'file', extension: string): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const h = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');
  const sec = String(now.getSeconds()).padStart(2, '0');
  return `evidence-${type}-${y}${m}${d}-${h}${min}${sec}.${extension}`;
}
