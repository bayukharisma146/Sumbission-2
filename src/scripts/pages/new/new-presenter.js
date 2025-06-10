export default class NewPresenter {
  #view;
  #model;

  constructor({ view, model }) {
    this.#view = view;
    this.#model = model;
  }

  /**
   * Mengirim data cerita ke API (fitur Dicoding Story App).
   * @param {FormData} formData - FormData berisi description, photo, lat, lon (opsional).
   */
  async submitNewStory(formData) {
    if (typeof this.#view.showSubmitLoadingButton === 'function') {
      this.#view.showSubmitLoadingButton();
    } else {
      console.error('submitNewStory: this.#view.showSubmitLoadingButton is not a function.');
    }

    try {
      const response = await this.#model.addNewStory(formData);

      if (!response || typeof response.ok === 'undefined') {
        console.error('submitNewStory: Invalid response from API:', response);
        throw new Error('Respons tidak valid dari API.');
      }

      if (!response.ok) {
        console.error('submitNewStory: Gagal mengunggah cerita:', response);
        this.#view.storyAddFailed?.(response.message || 'Gagal mengunggah cerita.');
        return;
      }

      this.#view.storySuccessfullyAdded?.(response.message || 'Cerita berhasil diunggah!');
    } catch (error) {
      console.error('submitNewStory: Error:', error);
      this.#view.storyAddFailed?.(error.message || 'Terjadi kesalahan saat mengunggah cerita.');
    } finally {
      this.#view.hideSubmitLoadingButton?.();
    }
  }

  /**
   * Mengirim laporan kerusakan ke API.
   * @param {Object} data - Data laporan: title, damageLevel, description, evidenceImages, latitude, longitude
   */
  async postNewReport({ title, damageLevel, description, evidenceImages, latitude, longitude }) {
    if (typeof this.#view.showSubmitLoadingButton === 'function') {
      this.#view.showSubmitLoadingButton();
    }

    try {
      const payload = {
        title,
        damageLevel,
        description,
        evidenceImages,
        latitude,
        longitude,
      };

      const response = await this.#model.addNewReport(payload);

      if (!response || typeof response.ok === 'undefined' || !response.ok) {
        console.error('postNewReport: response error:', response);
        this.#view.storeFailed?.(response.message || 'Gagal menyimpan laporan.');
        return;
      }

      // Kirim notifikasi (tidak perlu menunggu)
      this.#notifyToAllUser(response.data.id);

      this.#view.storeSuccessfully?.(response.message, response.data);
    } catch (error) {
      console.error('postNewReport: error:', error);
      this.#view.storeFailed?.(error.message || 'Terjadi kesalahan saat mengirim laporan.');
    } finally {
      this.#view.hideSubmitLoadingButton?.();
    }
  }

  /**
   * Mengirim notifikasi ke seluruh pengguna.
   * @param {string} reportId
   */
  async #notifyToAllUser(reportId) {
    try {
      const response = await this.#model.sendReportToAllUserViaNotification(reportId);
      if (!response.ok) {
        console.error('#notifyToAllUser: gagal kirim notifikasi:', response);
        return false;
      }
      return true;
    } catch (error) {
      console.error('#notifyToAllUser: error:', error);
      return false;
    }
  }
}
