"use strict";

import { isNumber } from "/app/common/object-utils/object-utils.js";

export const STATUS_IDLE = "Idle";
export const STATUS_LOADING = "Loading";

const phoneNumbersAdapter = RTK.createEntityAdapter();

const initialState = phoneNumbersAdapter.getInitialState({
  paginationData: {
    page: 1, // current page
    countPerPage: 5, // nb of phones per page
    totalCount: 0, // total number of phones, including the ones on the server
  },
  devices: [], // list of all available devices
  filters: {
    phoneNumber: null, // filter by phone number
  },
  status: STATUS_IDLE,
  errorMessage: null,
});

/**
 * Calculates the offset of the given page, and given the countPerPage.
 */
const calculatePageOffset = (page, countPerPage) => (page - 1) * countPerPage;

/**
 * Calculates the total pages count, given the totalCount of the phones and the countPerPage.
 */
const calculatePagesCount = (totalCount, countPerPage) => Math.ceil(totalCount / countPerPage);

/**
 * Calculates the total count of the phones using the right api call depending on the filters.
 */
const getTotalCount = async (phoneNumbersApi, filters) => {
  if (filters.phoneNumber) {
    return await phoneNumbersApi.getPhoneNumbersCountForPhoneNumber(filters.phoneNumber);
  } else {
    return await phoneNumbersApi.getPhoneNumbersCount();
  }
};

/**
 * Navigates the state to the given page, and updates pagination data.
 * @param {page} page - the page to navigate to. If less than 1, navigates to the first page. If greater than pagesCount, navigates to the last page.
 * @param {phoneNumbersApi} phoneNumbersApi - the phone numbers API
 */
const goToPage = RTK.createAsyncThunk("phoneNumbers/goToPage", async (args, utils) => {
  try {
    if (!isNumber(args.page)) {
      throw new Error("page must be a number");
    }
    const filters = filtersSelector(utils.getState());

    const currentPaginationData = paginationDataSelector(utils.getState());
    const countPerPage = currentPaginationData.countPerPage;

    const totalCount = await getTotalCount(args.phoneNumbersApi, filters);

    const pagesCount = calculatePagesCount(totalCount, countPerPage);

    let page = args.page;
    if (page < 1) {
      page = 1;
    } else if (page > pagesCount && pagesCount > 0) {
      page = pagesCount;
    }
    const offset = calculatePageOffset(page, countPerPage);

    // check if there is a filter on the phone number
    let phoneNumbers = [];
    if (filters.phoneNumber) {
      phoneNumbers = await args.phoneNumbersApi.getPhoneNumbersByPhoneNumberPaginated(
        filters.phoneNumber,
        offset,
        countPerPage,
        false
      );
    } else {
      phoneNumbers = await args.phoneNumbersApi.getPhoneNumbersPaginated(offset, countPerPage);
    }

    await Promise.all(
      phoneNumbers.map(async (phoneNumber) => {
        const deviceName = (await args.devicesApi.getDeviceById(phoneNumber.deviceId)).Name;
        phoneNumber.deviceName = deviceName;
        switch (phoneNumber.status) {
          case 1:
            phoneNumber.status = "Reserved";
            break;
          case 2:
            phoneNumber.status = "Available";
            break;
        }
        return phoneNumber;
      })
    );

    const updatedPaginationData = { ...currentPaginationData, page: page, totalCount: totalCount };

    return utils.fulfillWithValue({ phoneNumbers, updatedPaginationData });
  } catch (e) {
    return utils.rejectWithValue(e);
  }
});

/**
 * Adds a phone number with the given number and associated device and status.
 * @param {phoneNumber} phoneNumber - the number of the phone to add
 * @param {deviceName} deviceName - the name of the device associated to the phone number
 * @param {status} status - the status of the phone number
 * @param {phoneNumbersApi} phoneNumbersApi - the phone numbers API
 */
const addPhoneNumber = RTK.createAsyncThunk("phoneNumbers/addPhoneNumber", async (args, utils) => {
  try {
    await args.phoneNumbersApi.addPhoneNumber(args.phoneNumber, args.deviceId, args.status);
    return utils.fulfillWithValue();
  } catch (e) {
    return utils.rejectWithValue(e);
  }
});

/**
 * Fetches All the available devices ids.
 * @param {devicesApi} devicesApi - the devices API
 */
const getDevices = RTK.createAsyncThunk("phoneNumbers/getDevices", async (args, utils) => {
  try {
    const devices = await args.devicesApi.getAllDevices();
    return utils.fulfillWithValue(devices);
  } catch (e) {
    return utils.rejectWithValue(e);
  }
});

const phoneNumbersSlice = RTK.createSlice({
  name: "phoneNumbers",
  initialState,
  reducers: {
    changePhoneNumberFilter(state, action) {
      state.filters.phoneNumber = action.payload.phoneNumber;
    },
    changeCountPerPage(state, action) {
      state.paginationData.countPerPage = action.payload.countPerPage;
    },
  },
  extraReducers: (builder) => {
    const defaultErrorMessage = "An error has occurred, please refresh the page.";
    // handle goToPage
    builder
      .addCase(goToPage.pending, (state, action) => {
        state.status = STATUS_LOADING;
      })
      .addCase(goToPage.fulfilled, (state, action) => {
        // update phone numbers
        phoneNumbersAdapter.setAll(state, action.payload.phoneNumbers);
        // update paginated data
        state.paginationData = action.payload.updatedPaginationData;

        state.status = STATUS_IDLE;
      })
      .addCase(goToPage.rejected, (state, action) => {
        state.errorMessage = defaultErrorMessage;
        state.status = STATUS_IDLE;
      });

    // handle addPhoneNumber
    builder
      .addCase(addPhoneNumber.pending, (state, action) => {
        state.status = STATUS_LOADING;
      })
      .addCase(addPhoneNumber.fulfilled, (state, action) => {
        state.status = STATUS_IDLE;
      })
      .addCase(addPhoneNumber.rejected, (state, action) => {
        state.errorMessage = defaultErrorMessage;
        state.status = STATUS_IDLE;
      });

    // handle getDevices
    builder
      .addCase(getDevices.pending, (state, action) => {
        state.status = STATUS_LOADING;
      })
      .addCase(getDevices.fulfilled, (state, action) => {
        state.devices = action.payload;
        state.status = STATUS_IDLE;
      })
      .addCase(getDevices.rejected, (state, action) => {
        state.errorMessage = defaultErrorMessage;
        state.status = STATUS_IDLE;
      });
  },
});

// Action Creators
export const phoneNumbersActions = {
  ...phoneNumbersSlice.actions,
  goToPage,
  addPhoneNumber,
  getDevices,
};

// Reducer
export default phoneNumbersSlice.reducer;

// Selectors
export const phonesListSelector = (state) => Object.values(state.phoneNumbersViewState.entities);

export const paginationDataSelector = (state) => state.phoneNumbersViewState.paginationData;

export const pagesCountSelector = (state) =>
  calculatePagesCount(paginationDataSelector(state).totalCount, paginationDataSelector(state).countPerPage);

export const statusSelector = (state) => state.phoneNumbersViewState.status;

export const filtersSelector = (state) => state.phoneNumbersViewState.filters;

export const devicesSelector = (state) => state.phoneNumbersViewState.devices;

export const errorMessageSelector = (state) => state.phoneNumbersViewState.errorMessage;
