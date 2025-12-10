import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share'


export const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onloadend = () => {
    // reader.result = "data:application/pdf;base64,JVBERi0x..."
    const base64 = (reader.result as string).split(",")[1]; // lấy phần base64 thực
    resolve(base64);
  };
  reader.onerror = reject;
  reader.readAsDataURL(file);
});


export const downloadPDFiOS = async (blob: Blob, fileName: string) => {
  const base64 = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });

  const savedFile = await Filesystem.writeFile({
    path: fileName,
    data: base64,
    directory: Directory.Documents,
  });
  await Share.share({
    title: fileName,
    url: savedFile.uri,
  });
};