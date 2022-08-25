"use strict";

import { isNumber } from "/app/common/object-utils/object-utils.js";

export const STATUS_IDLE = "Idle";
export const STATUS_LOADING = "Loading";

const devicesAdapter = RTK.createEntityAdapter();

const initialState = devicesAdapter.getInitialState({
  paginationData: {
    page: 1, // current page
    countPerPage: 5, // nb of devices per page
    totalCount: 0, // total number of devices, including the ones on the server
  },
  filters: {
    deviceName: null, // filter by device name
  },
  status: STATUS_IDLE,
  errorMessage: null,
});

/**
 * Calculates the offset of the given page, and given the countPerPage.
 */
const calculatePageOffset = (page, countPerPage) => (page - 1) * countPerPage;

/**
 * Calculates the total pages count, given the totalCount of the devices and the countPerPage.
 */
const calculatePagesCount = (totalCount, countPerPage) => Math.ceil(totalCount / countPerPage);

/**
 * Calculates the total count of the devices using the right api call depending on the filters.
 */
const getTotalCount = async (devicesApi, filters) => {
  if (filters.deviceName) {
    return await devicesApi.getDevicesCountForName(filters.deviceName);
  } else {
    return await devicesApi.getDevicesCount();
  }
};

/**
 * Navigates the state to the given page, and updates pagination data.
 * @param {page} page - the page to navigate to. If less than 1, navigates to the first page. If greater than pagesCount, navigates to the last page.
 * @param {devicesApi} devicesApi - the devices API
 */
const goToPage = RTK.createAsyncThunk("devices/goToPage", async (args, utils) => {
  try {
    if (!isNumber(args.page)) {
      throw new Error("page must be a number");
    }
    const filters = filtersSelector(utils.getState());

    const currentPaginationData = paginationDataSelector(utils.getState());
    const countPerPage = currentPaginationData.countPerPage;

    const totalCount = await getTotalCount(args.devicesApi, filters);

    const pagesCount = calculatePagesCount(totalCount, countPerPage);

    let page = args.page;
    if (page < 1) {
      page = 1;
    } else if (page > pagesCount && pagesCount > 0) {
      page = pagesCount;
    }
    const offset = calculatePageOffset(page, countPerPage);

    // check if there is a filter on the device name
    let devices = [];
    if (filters.deviceName) {
      devices = await args.devicesApi.getDevicesByNamePaginated(filters.deviceName, offset, countPerPage, false);
    } else {
      devices = await args.devicesApi.getDevicesPaginated(offset, countPerPage);
    }

    const updatedPaginationData = { ...currentPaginationData, page: page, totalCount: totalCount };

    return utils.fulfillWithValue({ devices, updatedPaginationData });
  } catch (e) {
    return utils.rejectWithValue(e);
  }
});

/**
 * Adds a device with the given name.
 * @param {deviceName} deviceName - the name of the device to add
 * @param {devicesApi} devicesApi - the devices API
 */
const addDevice = RTK.createAsyncThunk("devices/addDevice", async (args, utils) => {
  try {
    await args.devicesApi.addDevice(args.deviceName);
    return utils.fulfillWithValue();
  } catch (e) {
    return utils.rejectWithValue(e);
  }
});

/**
 * Updates the device with the given properties.
 * @param {deviceId} deviceId - the id of the device to update
 * @param {deviceName} deviceName - the new name of the device
 * @param {devicesApi} devicesApi - the devices API
 */
const updateDevice = RTK.createAsyncThunk("devices/updateDevice", async (args, utils) => {
  try {
    await args.devicesApi.updateDevice(args.deviceId, args.deviceName);
    return utils.fulfillWithValue();
  } catch (e) {
    return utils.rejectWithValue(e);
  }
});

const devicesSlice = RTK.createSlice({
  name: "devices",
  initialState,
  reducers: {
    changeDeviceNameFilter(state, action) {
      state.filters.deviceName = action.payload.deviceName;
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
        // update devices
        devicesAdapter.setAll(state, action.payload.devices);
        // update paginated data
        state.paginationData = action.payload.updatedPaginationData;

        state.status = STATUS_IDLE;
      })
      .addCase(goToPage.rejected, (state, action) => {
        state.errorMessage = defaultErrorMessage;
        state.status = STATUS_IDLE;
      });

    // handle addDevice
    builder
      .addCase(addDevice.pending, (state, action) => {
        state.status = STATUS_LOADING;
      })
      .addCase(addDevice.fulfilled, (state, action) => {
        state.status = STATUS_IDLE;
      })
      .addCase(addDevice.rejected, (state, action) => {
        state.errorMessage = defaultErrorMessage;
        state.status = STATUS_IDLE;
      });

    // handle updateDevice
    builder
      .addCase(updateDevice.pending, (state, action) => {
        state.status = STATUS_LOADING;
      })
      .addCase(updateDevice.fulfilled, (state, action) => {
        state.status = STATUS_IDLE;
      })
      .addCase(updateDevice.rejected, (state, action) => {
        state.errorMessage = defaultErrorMessage;
        state.status = STATUS_IDLE;
      });
  },
});

// Action Creators
export const devicesActions = {
  ...devicesSlice.actions,
  goToPage,
  addDevice,
  updateDevice,
};

// Reducer
export default devicesSlice.reducer;

// Selectors
export const devicesListSelector = (state) => Object.values(state.devicesViewState.entities);

export const paginationDataSelector = (state) => state.devicesViewState.paginationData;

export const pagesCountSelector = (state) =>
  calculatePagesCount(paginationDataSelector(state).totalCount, paginationDataSelector(state).countPerPage);

export const statusSelector = (state) => state.devicesViewState.status;

export const filtersSelector = (state) => state.devicesViewState.filters;

export const errorMessageSelector = (state) => state.devicesViewState.errorMessage;
