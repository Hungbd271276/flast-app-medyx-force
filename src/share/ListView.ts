export type ListViewProps = {
    id: number,
    label: string,
    title: string,
    icon: string,
    parentId: number,
    status: number,
    type: 'form' | 'listView',
    layout: string
}
export type ListChildViewProps = {
    id: number
    label: string,
    title: string,
    icon: string,
    parentId: number,
    status: number,
    type: string,
    layout: string,
    children: ListChildViewProps[]
}