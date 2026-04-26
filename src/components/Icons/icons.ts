import IC_Account from './svgs/ic_account.svg';
import IC_AllLink from './svgs/ic_all_link.svg';
import IC_ArrowdropDown from './svgs/ic_arrowdrop_down.svg';
import IC_ArrowdropLeft from './svgs/ic_arrowdrop_left.svg';
import IC_ArrowdropRight from './svgs/ic_arrowdrop_right.svg';
import IC_ArrowdropUp from './svgs/ic_arrowdrop_up.svg';
import IC_Backward from './svgs/ic_backward.svg';
import IC_Chat from './svgs/ic_chat.svg';
import IC_Check from './svgs/ic_check.svg';
import IC_Close from './svgs/ic_close.svg';
import IC_Complete from './svgs/ic_complete.svg';
import IC_Copy from './svgs/ic_copy.svg';
import IC_Delete from './svgs/ic_delete.svg';
import IC_Down from './svgs/ic_down.svg';
import IC_Download from './svgs/ic_download.svg';
import IC_Error from './svgs/ic_error.svg';
import IC_Forward from './svgs/ic_forward.svg';
import IC_Home from './svgs/ic_home.svg';
import IC_Info from './svgs/ic_info.svg';
import IC_LandingBackground from './svgs/ic_landing_background.svg';
import IC_LandingIcLogo from './svgs/ic_landing_ic_logo.svg';
import IC_LandingTextLogo from './svgs/ic_landing_text_logo.svg';
import IC_LinkAdd from './svgs/ic_link_add.svg';
import IC_LinkOpen from './svgs/ic_link_open.svg';
import IC_Logo from './svgs/ic_logo.svg';
import IC_Logout from './svgs/ic_logout.svg';
import IC_MoreHori from './svgs/ic_more_hori.svg';
import IC_MoreVert from './svgs/ic_more_vert.svg';
import IC_Regenerate from './svgs/ic_regenerate.svg';
import IC_Search from './svgs/ic_search.svg';
import IC_SendFilled from './svgs/ic_send_filled.svg';
import IC_SendOutline from './svgs/ic_send_outlined.svg';
import IC_SidenavOpen from './svgs/ic_sidenav_open.svg';
import IC_Stop from './svgs/ic_stop.svg';
import IC_SumGenerate from './svgs/ic_sum_generate.svg';
import IC_ThumbDownFilled from './svgs/ic_thumb_down_filled.svg';
import IC_ThumbDownOutline from './svgs/ic_thumb_down_outline.svg';
import IC_ThumbUpFilled from './svgs/ic_thumb_up_filled.svg';
import IC_ThumbUpOutline from './svgs/ic_thumb_up_outline.svg';
import IC_Undo from './svgs/ic_undo.svg';
import IC_Up from './svgs/ic_up.svg';
import IC_Warning from './svgs/ic_warning.svg';

export const IconMap = {
  IC_Account,
  IC_AllLink,
  IC_ArrowdropDown,
  IC_ArrowdropLeft,
  IC_ArrowdropRight,
  IC_ArrowdropUp,
  IC_Backward,
  IC_Chat,
  IC_Check,
  IC_Close,
  IC_Complete,
  IC_Copy,
  IC_Delete,
  IC_Down,
  IC_Download,
  IC_Error,
  IC_Forward,
  IC_Home,
  IC_Info,
  IC_LandingBackground,
  IC_LandingIcLogo,
  IC_LandingTextLogo,
  IC_LinkAdd,
  IC_LinkOpen,
  IC_Logo,
  IC_Logout,
  IC_MoreHori,
  IC_MoreVert,
  IC_Regenerate,
  IC_Search,
  IC_SendFilled,
  IC_SendOutline,
  IC_SidenavOpen,
  IC_Stop,
  IC_SumGenerate,
  IC_ThumbDownFilled,
  IC_ThumbDownOutline,
  IC_ThumbUpFilled,
  IC_ThumbUpOutline,
  IC_Undo,
  IC_Up,
  IC_Warning,
} as const;

export type IconMapTypes = keyof typeof IconMap;

export const IconSizes = {
  xs: 14,
  sm: 16,
  md: 18,
  lg: 20,
  xl: 24,
} as const;

export type IconSizeTypes = keyof typeof IconSizes;

export const buttonSizeMap = {
  sm: 'sm',
  md: 'lg',
  lg: 'xl',
} as const;
