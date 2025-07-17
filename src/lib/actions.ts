'use server';

import { revalidatePath } from 'next/cache';

export async function deleteFeedbackAction(feedbackId: string) {
  try {
    const response = await fetch(`https://spss.io.vn/api/Feedback/${feedbackId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': 'Bearer YOUR_TOKEN_HERE', // Thay thế bằng bearer token của bạn
      },
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to delete feedback: ${errorText}`);
    }
    
    revalidatePath('/dashboard/feedback'); // Làm mới lại dữ liệu trên trang feedback
    return { success: true, message: 'Feedback deleted successfully.' };
  } catch (error) {
    console.error('Delete feedback error:', error);
    return { success: false, message: (error as Error).message };
  }
}