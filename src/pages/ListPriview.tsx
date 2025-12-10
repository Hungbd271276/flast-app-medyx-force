import { useEffect, useRef, useState } from 'react';
import { Storage } from '@capacitor/storage';
import { IonButton, IonContent, IonImg, IonItem, IonLabel, IonList, IonLoading, IonPage, IonPopover } from '@ionic/react';
import avatar from '../assets/images/avatar.png';
import search from '../assets/svg/SEARCH.svg';
import './ListPriview.css';
import axiosInstance from '../utils/functions/axios';
import { ListChildViewProps, ListViewProps } from '../share/ListView';
import { useDispatch } from 'react-redux';
import { setListTreType } from '../utils/redux/reducer/listViewSlice';
import { useSelector } from '../utils/redux/hooks';

function buildMenuTree(items: ListViewProps[]) {
  const map = new Map<number, ListChildViewProps>();
  const roots: any[] = [];
  items.forEach(item => {
    map.set(item.id, { ...item, children: [] });
  });
  map.forEach(item => {
    if (item.parentId === 0) {
      roots.push(item);
    } else {
      const parent = map.get(item.parentId);
      if (parent) {
        parent.children.push(item);
      }
    }
  });
  return roots;
}

const ListPreviewPage: React.FC = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.userInfoState);
  const { listTreType } = useSelector(state => state.listViewState);
  const [ expanded, setExpanded ] = useState<{ [key: number]: boolean }>({});
  const [ loading, setLoading ] = useState<boolean>(false);
  const [popoverEvent, setPopoverEvent] = useState<MouseEvent | undefined>(undefined);
  const [showPopover, setShowPopover] = useState(false);
  const avatarRef = useRef<HTMLDivElement | null>(null);

  const toggleExpand = (id: number) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      // const userResult = localStorage.getItem('auth_token');
      const userResult = await Storage.get({ key: 'auth_user' });
      if (!userResult.value) {
        setLoading(false);
        await Storage.clear();
        return window.location.href = '/login';
      } else {
        const { data } = await axiosInstance.get(`/MedyxAPI/MenuList`);
        await new Promise(resolve => setTimeout(resolve, 500));
        setLoading(false);
        const checkTypeView = data.data.filter((f: ListViewProps) => f.type === "listView");
        const tree = buildMenuTree(checkTypeView);
        dispatch(setListTreType(tree));
      }
    })();
  }, [dispatch]);

  const handleLogout = async () => {
    await Storage.clear();
    window.location.href = '/login';
  };
  const renderMenu = (items: ListChildViewProps[], level = 0) => {
    return items.map((item, i: number) => (
      <div key={item.id}>
        <div
          className={`item_child ${level === 0 ? 'menu-parent' : 'menu-child'}`}
          style={{
            marginLeft: level * 24,
            display: 'flex',
            alignItems: 'center',
            cursor: item.children.length > 0 ? 'pointer' : 'default'
          }}
          onClick={() => item.children.length > 0 && toggleExpand(item.id)}
        >
          <div style={{ width: '80%', display: 'flex', justifyContent: 'start', alignItems: 'center' }}>
            <div className='stroke'>{i + 1}</div>
            <div className='user_title' style={{ marginLeft: 15 }}>
              <p className='title'>{item.label}</p>
              <p className='content'>{item.title}</p>
            </div>
          </div>
          <div className='arrow' style={{ width: '20%' }}>
            {/* <IonImg src={arrowList} style={{ width: '24px', height: '24px' }} alt="arrow" /> */}
          </div>
        </div>
        {item.children.length > 0 && expanded[item.id] && (
          <div>
            {renderMenu(item.children, level + 1)}
          </div>
        )}
      </div>
    ));
  };

  return (
    <IonPage>
      <IonContent fullscreen className='list_preview_content' scrollY={true}>
        <div className='background-image'>
          <div className='background-overlay'>
            <div className='infoUser' ref={avatarRef} onClick={(e) => {
                e.persist(); // Giữ event lại (quan trọng)
                setPopoverEvent(e.nativeEvent);
                setShowPopover(true);
              }} >
              <IonImg
                src={user?.avatar ? user?.avatar : avatar}
                style={{ width: '46px', height: '46px', borderRadius: 50 }}
                alt="avatar"
              />
            </div>
            <IonPopover
              isOpen={showPopover}
              event={popoverEvent}
              onDidDismiss={() => setShowPopover(false)}
            >
              <IonList>
                <IonItem button onClick={handleLogout}>
                  <IonLabel>Đăng xuất</IonLabel>
                </IonItem>
              </IonList>
            </IonPopover>

            <div className='title_heading'>
              <p>Bệnh viện BC</p>
            </div>
            <div className='div3'>
              <IonImg
                src={search}
                style={{ width: '32px', height: '32px' }}
                alt="search"
              />
            </div>
          </div>

          {loading ? (
            <IonLoading
              isOpen={loading}
              message="Đang tải dữ liệu..."
              spinner="circles"
            />
          ) : (
            <div className='list_content'>
              <div style={{ padding: '15px 30px' }}>
                <h3>Quick access</h3>
                <div className='list_items'>
                  <IonLabel className='lab_items'>AI Mulk</IonLabel>
                  <IonLabel className='lab_items'>As Sajdah</IonLabel>
                  <IonLabel className='lab_items'>AI Kahf</IonLabel>
                  <IonLabel className='lab_items'>Ya Sin</IonLabel>
                </div>
              </div>
              <h3 style={{paddingTop: 10, paddingLeft: 30, paddingRight: 30, margin: 0}}>Danh sách khoa</h3>
              <div className='list_items_content'>
                {renderMenu(listTreType ?? [])}
              </div>
            </div>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default ListPreviewPage;
