import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ListChildViewProps } from '../../../share/ListView';

export type ListViewState = {
  listTreType: ListChildViewProps[] | null;
}

const initialState: ListViewState = {
  listTreType: null,
};

const listViewSlice = createSlice({
  name: 'listView',
  initialState,
  reducers: {
    setListTreType(state, action: PayloadAction<ListChildViewProps[]>) {
      state.listTreType = action.payload;
    },
  },
});

export const { setListTreType } = listViewSlice.actions;
const listViewReducer = listViewSlice.reducer;
export default listViewReducer;
