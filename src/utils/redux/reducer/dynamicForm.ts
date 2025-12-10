import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ListFormProps } from '../../../share/Form';

export type ListFormState = {
  listForm: {
    controlForm: ListFormProps[];
    orderId: number;
    title: string
  }[]
}

const initialState: ListFormState = {
  listForm: [
    { controlForm: [],orderId: 0, title: ''}
  ],
};
const listFormSlice = createSlice({
  name: 'listFormSign',
  initialState,
  reducers: {
    setListForm(state, action: PayloadAction<ListFormState["listForm"]>) {
      state.listForm = action.payload;
    },
  },
});

export const { setListForm } = listFormSlice.actions;
const listFormReducer = listFormSlice.reducer;
export default listFormReducer;
