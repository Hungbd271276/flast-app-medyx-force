import { InAppBrowser } from '@awesome-cordova-plugins/in-app-browser';
import { isPlatform } from '@ionic/react';

export const openPDFInBrowser = (pdfUrl: string, fallbackUrl?: string) => {
    const options: any = {
        location: 'yes',
        toolbar: 'yes',
        presentationstyle: 'fullscreen',
        zoom: 'yes',
        hideurlbar: 'no',
        beforeload: 'yes',
        hidenavigationbuttons: 'no',
        hardwareback: 'yes',
        allowInlineMediaPlayback: 'yes',
        mediaPlaybackRequiresUserAction: 'no',
        // Thêm các tùy chọn đặc biệt cho iOS
        ...(isPlatform('ios') && {
            disallowoverscroll: 'yes',
            toolbarposition: 'top'
        }),
        // Thêm các tùy chọn đặc biệt cho Android
        ...(isPlatform('android') && {
            closebuttoncaption: 'Đóng',
            closebuttoncolor: '#ffffff'
        })
    };

    try {
        // Tạo InAppBrowser instance
        InAppBrowser.create(pdfUrl, '_blank', options);
    } catch (error) {
        console.error('Error creating InAppBrowser:', error);
        // Fallback: mở trong trình duyệt mặc định
        if (fallbackUrl) {
            window.open(fallbackUrl, '_system');
        } else {
            window.open(pdfUrl, '_system');
        }
    }
};

// Hàm kiểm tra xem có thể mở PDF không
export const canOpenPDF = () => {
    return typeof InAppBrowser !== 'undefined' && InAppBrowser.create;
}; 