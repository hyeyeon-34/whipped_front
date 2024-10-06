import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { MdCatchingPokemon, MdCleaningServices, MdClose } from 'react-icons/md';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import Navbar from './Navbar';
const Cart = () => {
  const navigate = useNavigate();
  const [carts, setCarts] = useState([]);
  const authData = useSelector((state) => state.auth.authData);
  const userId = authData ? authData.id : null;
  const [isOpen, setIsOpen] = useState(true);
  const [isNormal, setIsNormal] = useState(true);
  const [totalPrice, setTotalPrice] = useState('');
  const [selectedPrice, setSelectedPrice] = useState('')
  const [diPrice, setDiyPrice] = useState('')
  const { productId } = useParams();
  const [diyItem, setDiyItems] = useState([])
  const openItems = () => {
    setIsOpen(!isOpen);
  };
  const normalItem = () => {
    setIsNormal(!isNormal);
  };
  //  선택상품 보내기
  const [checkItems, setCheckItems] = useState([]);
  const handleSingleCheck = (checked, productId, productSize, quantity, isDiy = false, cartItemId , details) => {
    if (checked) {
      // 배열에 선택된 아이템 추가
      setCheckItems((prev) => [...prev, { productId, productSize, quantity, isDiy, cartItemId, details }]);
    } else {
      // 선택 해제된 아이템을 배열에서 제거
      setCheckItems((prev) =>
        prev.filter(
          (item) =>
            !(item.productId === productId && item.productSize === productSize && cartItemId === item.cartItemId )
        )
      );
    }
  };
  
  const selectedPurchase = () => {
    if (checkItems.length === 0) {
      alert('선택된 상품이 없습니다.');
      return;
    }
  
    const selectedItems = checkItems.map((item) => {
      if (item.isDiy) {
        // DIY 아이템의 경우
        const diyItemm = diyItem.find(diy => diy.cart_item_id === item.cartItemId);
        return {
          productId: item.productId,
          productSize: null, // DIY는 사이즈가 없으므로 null
          quantity: item.quantity,
          productName: diyItemm?.details?.p_name || '', // DIY 아이템의 이름
          price: diyItemm?.details?.p_price || '', // DIY 아이템의 가격
          img: diyItemm?.details?.p_main_img || '', // DIY 아이템의 이미지
          details: diyItemm?.details || {}, // Include details
          selected_options: diyItemm?.selected_options || [], 
        };
      } else {
        // 일반 아이템의 경우
        const cartItem = carts.find(
          (cart) => cart.product_id === item.productId && cart.product_size === item.productSize
        );
        return {
          productId: item.productId,
          productSize: item.productSize,
          quantity: item.quantity,
          productName: cartItem
            ? item.productSize === '80g'
              ? cartItem.details?.p_name
              : cartItem.details?.p_name_1
            : '',
          price: cartItem ? (item.productSize === '80g' ? cartItem.details?.p_price : cartItem.details?.p_price_1) : '',
          img: cartItem
            ? item.productSize === '80g'
              ? cartItem.details?.p_main_img
              : cartItem.details?.p_main_img_1
            : '',
          details: cartItem ? cartItem.details : {}, // Include details if available
        };
      }
    });
  
    console.log(selectedItems);
    navigate('/purchase', {
      state: { selectedItems },
    });
    console.log(checkItems);
  };
  

  // 전체 상품 주문

  // 선택 상품  1개 보내기
  const handlePurchase = (cart) => {
    navigate('/purchase', {
      state: {
        productId: cart.product_id,
        productName: cart.product_size === '80g' ? cart.details?.p_name : cart.details?.p_name_1,
        productSize: cart.product_size,
        quantity: cart.quantity,
        price: cart.product_size === '80g' ? cart.details?.p_price : cart.details?.p_price_1,
        img: cart.product_size === '80g' ? cart.details?.p_main_img : cart.details?.p_main_img_1,
      },
    });
  };
  const handleDiyPurchase= (item) =>{
    navigate('/purchase', {
      state : {
        productId : item.product_id,
        productName : item.details?.p_name,
        productSize : null,
        quantity : item.quantity,
        price : item.details?.p_price,
        img : item.details?.p_main_img,
        selected_options: item.selected_options || [], 
      }
    })
  }
  const handleOrderAll = () => {
    // 일반 상품 아이템 처리
    const allItems = carts.map((item) => ({
      productId: item.product_id,
      productSize: item.product_size,
      quantity: item.quantity,
      productName: item.product_size === '80g' ? item.details?.p_name : item.details?.p_name_1,
      price: item.product_size === '80g' ? item.details?.p_price : item.details?.p_price_1,
      img: item.product_size === '80g' ? item.details?.p_main_img : item.details?.p_main_img_1,
      details: item.details, // Include details
    }));
  
    // DIY 상품 아이템 처리
    const diyItemsMapped = diyItem.map((item) => ({
      productId: item.product_id,
      productSize: null,  // DIY 아이템은 사이즈가 없으므로 null로 설정
      quantity: item.quantity,
      productName: item.details?.p_name, // DIY 아이템의 이름
      price: item.details?.p_price,      // DIY 아이템의 가격
      img: item.details?.p_main_img,     // DIY 아이템의 이미지
      details: item.details,   
      selected_options: item.selected_options || [],          // Include details
    }));
  
    // 일반 상품과 DIY 상품을 합침
    const allItemsWithDiy = [...allItems, ...diyItemsMapped];
  
    // 구매 페이지로 이동
    navigate('/purchase', {
      state: { selectedItems: allItemsWithDiy },
    });
  };
  

  useEffect(() => {
    const fetchCarts = async () => {
      try {
        const response = await axios.get(`https://whippedb4.hyee34.site/get_cart/${userId}`);
        const {cartItems, diyItems } = response.data;
        const productRequests = cartItems.map((item) =>
          axios.get(`https://whippedb4.hyee34.site/get_detail_products/${item.product_id}`)
        );

        const productResponses = await Promise.all(productRequests);

        const productsWithDetails = cartItems.map((item, index) => ({
          ...item,
          details: productResponses[index].data[0],
        }));



        const diyRequests = diyItems.map((item) =>
          axios.get(`https://whippedb4.hyee34.site/get_detail_products/${item.product_id}`)
        );
        const diyResponses = await Promise.all(diyRequests);
        
        const productsWithDiyDetails = diyItems.map((item, index) => ({
          ...item,
          details: diyResponses[index].data[0],
        }));
        const sortedCarts = productsWithDetails.sort((a, b) => {
          if (a.product_id !== b.product_id) {
            return a.product_id - b.product_id;
          }
          return (a.product_size || '').localeCompare(b.product_size || '');
        });
  
        // 정렬: DIY 상품은 cart_item_id 기준으로 정렬
        const sortedDiyItems = productsWithDiyDetails.sort((a, b) => a.cart_item_id - b.cart_item_id);
  
        // 상태 업데이트
        setCarts(sortedCarts);
        setDiyItems(sortedDiyItems);
        // 가격 계산
        calculateTotalPrice(sortedCarts);
        calculateDiyPrice(sortedDiyItems);
  
      } catch (error) {
        console.log('Error fetching carts:', error);
      }
    };
    fetchCarts();
  }, [userId]);
  const calculateTotalPrice = (carts) => {
    const total = carts.reduce((sum, item) => {
      const itemPriceKey = item.product_size === '80g' ? 'p_price' : 'p_price_1';
      const itemPrice = parseInt(item.details?.[itemPriceKey]?.replace(/,/g, ''), 10) || 0;
      return sum + itemPrice * (item.quantity || 1);
    }, 0);
  
    return total;
  };
  
  const calculateDiyPrice = (diyItem) => {
    const total = diyItem.reduce((sum, item) => {
      const diyPrice = parseInt(item.details?.p_price.replace(/,/g, ''), 10) || 0;
      return sum + diyPrice * (item.quantity || 1);
    }, 0);
  
    return total;
  };
  
  const calculateSelectedCartsPrice = (checkItems) =>{
    const total = checkItems.reduce((sum, item)=>{
      const itemPriceKey = item.productSize === 'null' ? 'p_price' : (item.productSize === '130g' ? 'p_price_1' : 'p_price')
      // const itemPriceKey = item.product_size === '130g' ? 'p_price_1' : 'p_price';
      const itemPrice = parseInt(item.details?.[itemPriceKey].replace(/,/g, ''), 10)  || 0;
      return sum + itemPrice * (item.quantity)
    }, 0);
    return total;
  }

  useEffect(() => {
    if (carts && diyItem) {
      const cartTotal = calculateTotalPrice(carts);
      const diyTotal = calculateDiyPrice(diyItem);
      const selectedTotal = calculateSelectedCartsPrice(checkItems)
      const grandTotal = cartTotal + diyTotal;
      const formattedTotal = new Intl.NumberFormat().format(grandTotal);
      const formattedTotal2 = new Intl.NumberFormat().format(selectedTotal);
      setTotalPrice(formattedTotal);
      setSelectedPrice(formattedTotal2)
 
  
    }
  }, );
  

  
  
  const quantityChange = async (userId, productId, productSize, newQuantity, cartItemId) => {
    try {
      if (newQuantity < 1) return;
  
      const requestBody = cartItemId
        ? { cartItemId, newQuantity }
        : { productId, productSize, newQuantity };
  
      // 수량 업데이트 요청
      await axios.post(`https://whippedb4.hyee34.site/update_quantity/${userId}`, requestBody);
  
      // 장바구니와 DIY 아이템 모두 새로 가져오기
      const response = await axios.get(`https://whippedb4.hyee34.site/get_cart/${userId}`);
      const { cartItems, diyItems } = response.data;
  
      // 장바구니와 DIY 아이템의 상세 정보를 가져옵니다.
      const productRequests = cartItems.map(item =>
        axios.get(`https://whippedb4.hyee34.site/get_detail_products/${item.product_id}`)
      );
      const productResponses = await Promise.all(productRequests);
  
      const productsWithDetails = cartItems.map((item, index) => ({
        ...item,
        details: productResponses[index].data[0],
      }));
  
      const diyRequests = diyItems.map(item =>
        axios.get(`https://whippedb4.hyee34.site/get_detail_products/${item.product_id}`)
      );
      const diyResponses = await Promise.all(diyRequests);
  
      const productsWithDiyDetails = diyItems.map((item, index) => ({
        ...item,
        details: diyResponses[index].data[0],
      }));
  
 // 정렬 기준을 정의합니다
 const sortedCartItems = productsWithDetails.sort((a, b) => {
  if (a.product_id !== b.product_id) {
    return a.product_id - b.product_id;
  }
  return (a.product_size || '').localeCompare(b.product_size || '');
});

const sortedDiyItems = productsWithDiyDetails.sort((a, b) => a.cart_item_id - b.cart_item_id);

// 상태 업데이트
setCarts(sortedCartItems);
setDiyItems(sortedDiyItems);



// 총 가격 재계산
calculateTotalPrice(sortedCartItems);
calculateDiyPrice(sortedDiyItems);

// console.log(productsWithDetails);
  
    } catch (error) {
      console.log('Failed to update quantity', error.response || error.message);
    }
  };
  
  const handleQuantityChange = (productId, productSize, newQuantity, cartItemId) => {
    setCheckItems((prev) =>
      prev.map((item) =>
        item.productId === productId && item.productSize === productSize && item.cartItemId === cartItemId
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  
  

  

  const noItem = async (userId, productId, productSize, cartItemId) => {
    try {
      const isDiyItem = productSize === null;

    
      if (isDiyItem) {
        // DIY 아이템 삭제 요청
        await axios.post(`https://whippedb4.hyee34.site/delete_item/${userId}`, { cartItemId });
      } else {
        // 일반 아이템 삭제 요청
        await axios.post(`https://whippedb4.hyee34.site/delete_item/${userId}`, { productId, productSize });
      }
  
      // 장바구니에서 삭제된 아이템 필터링
      let updatedCarts = carts.filter((item) =>
        !(item.product_id === productId && item.product_size === productSize) &&
        !(item.is_bundle && item.cart_item_id === cartItemId)
      );
  
      // 일반 아이템의 상세 정보 요청
      const productRequests = updatedCarts
        .filter(item => !item.is_bundle)  // is_bundle이 false인 경우에만 요청
        .map((item) =>
          axios.get(`https://whippedb4.hyee34.site/get_detail_products/${item.product_id}`)
        );
  
      const productResponses = await Promise.all(productRequests);
  
      updatedCarts = updatedCarts.map((item) => {
        // 일반 아이템의 경우
        if (!item.is_bundle) {
          return {
            ...item,
            details: productResponses.find(response => response.data[0].product_id === item.product_id)?.data[0] || item.details,
          };
        }
        return item;
      });
  
      // DIY 아이템의 경우, details는 이미 포함되어 있어 필터링만 필요
      const updatedDiyItems = diyItem.filter(item =>
        item.cart_item_id !== cartItemId
      );




      
      const sortedCarts = updatedCarts.sort((a, b) => {
        if (a.product_id !== b.product_id) {
          return a.product_id - b.product_id;
        }
        return (a.product_size || '').localeCompare(b.product_size || '');
      });
  
      const sortedDiyItems = updatedDiyItems.sort((a, b) => a.cart_item_id - b.cart_item_id);
  
      setCarts(sortedCarts);
      setDiyItems(sortedDiyItems);
  
      calculateTotalPrice(sortedCarts);
      calculateDiyPrice(sortedDiyItems);
      const totalSelectedPrice = checkItems.reduce((acc, item) => acc + item.quantity * item.price, 0);
      setSelectedPrice(totalSelectedPrice);
    } catch (error) {
      console.log('Failed to delete item', error);
    }
  };


  
  const handleCheckChange = (productId, productSize, cartItemId) => {
    let updatedCheckItems = checkItems.filter((item) => {
      if (item.isDiy) {
        // DIY 제품의 경우 cartItemId로만 삭제
        return item.cartItemId !== cartItemId;
      } else {
        // 일반 제품의 경우 productId와 productSize로 삭제
        return !(item.productId === productId && item.productSize === productSize);
      }
    });
    
    setCheckItems(updatedCheckItems);
  };
  
  const deleteAll = async()=>{
    try {
     const response = await axios.post(`https://whippedb4.hyee34.site/delete_all/${userId}`)
      if (response.status === 200) {
        // Clear the cart items state to reflect the changes
        setCarts([])
        setDiyItems([]);
        console.log("All cart items deleted successfully.");
      }
    } catch (error) {
      console.log('Failed to delete item', error);
    }
  }
  const handleAllCheck = (checked) => {
    if (checked) {
      // 모든 상품의 정보를 checkItems 배열에 추가
      const allItems = carts.map(cart => ({
        productId: cart.product_id,
        productSize: cart.product_size,
        quantity: cart.quantity,
        details : cart.details,
        selectedOptions: cart.selected_options,
        cartItemId : cart.cart_item_id,
      }));
      const diyItems = diyItem.map(item =>({
        productId : item.product_id,
        productSize : null,
        quantity : item.quantity,
        details : item.details,
        isDiy : true,
        cartItemId : item.cart_item_id,
      }

      ))
      const Items = [...allItems, ...diyItems];
      console.log(checked);
      setCheckItems(Items); // 모든 상품을 checkItems에 저장
    } else {
      setCheckItems([]); // 전체 해제 시 checkItems 비우기
    }
  };

  const deleteCheckedItems = async () => {
  try {
    // 체크된 아이템 목록 준비
    const itemsToDelete = checkItems.map(item => {
      if (item.isDiy) {
        // DIY 아이템일 경우
        return {
          productId: item.productId,  // DIY 아이템의 경우 적절한 속성 사용
          productSize: null,  // DIY 아이템의 경우 productSize는 null일 수 있음
          cartItemId: item.cartItemId,
          details : item.details,
          isDiy: true,
          
        };
      } else {
        // 일반 아이템일 경우
        return {
          productId: item.productId,  // 일반 아이템의 경우 productId 사용
          productSize: item.productSize,
          cartItemId: item.cartItemId,  // 일반 아이템의 경우 cartItemId는 null일 수 있음
          isDiy: null,
          selectedOptions: item.selected_options
        };
      }
    });
    // 서버에 삭제 요청 전송
    await axios.post(`https://whippedb4.hyee34.site/delete_checked_items/${userId}`, { items: itemsToDelete });

    // 삭제 후 장바구니 데이터 가져오기
    const updatedCartResponse = await axios.get(`https://whippedb4.hyee34.site/get_cart/${userId}`);
    
    // 응답 데이터 로그에 찍기
    console.log('Updated Cart Response:', updatedCartResponse.data);

    // 장바구니 데이터에서 일반 아이템과 DIY 아이템 분리
    let updatedCarts = updatedCartResponse.data.cartItems; // 일반 아이템
    let updatedDiyItems = updatedCartResponse.data.diyItems; // DIY 아이템
   
    // 일반 아이템의 상세 정보 요청
    const productRequests = updatedCarts
      .filter(item => !item.is_bundle)  // is_bundle이 false인 경우에만 요청
      .map(item =>
        axios.get(`https://whippedb4.hyee34.site/get_detail_products/${item.product_id}`)
      );
   
    // 상세 정보 응답 받기
    const productResponses = await Promise.all(productRequests);
      
    // 아이템 상세 정보 업데이트
    updatedCarts = updatedCarts.map(item => {
      if (!item.is_bundle) {
        return {
          ...item,
          details: productResponses.find(response => response.data[0].product_id === item.product_id)?.data[0] || item.details,
        };
      }
      return item;
    });
  
    const diyRequests = updatedDiyItems.map(item =>
      axios.get(`https://whippedb4.hyee34.site/get_detail_products/${item.product_id}`)
    );
    const diyResponses = await Promise.all(diyRequests);

    const productsWithDiyDetails = updatedDiyItems.map((item, index) => ({
      ...item,
      details: diyResponses[index].data[0],
    }));

    // 아이템 정렬
    const sortedCarts = updatedCarts.sort((a, b) => {
      if (a.product_id !== b.product_id) {
        return a.product_id - b.product_id;
      }
      return (a.product_size || '').localeCompare(b.product_size || '');
    });


    const sortedDiyItems = productsWithDiyDetails.sort((a, b) => a.cart_item_id - b.cart_item_id);

    // 상태 업데이트
    setCarts(sortedCarts);  // 정렬된 일반 아이템 상태 업데이트
    setDiyItems(sortedDiyItems);  // 정렬된 DIY 아이템 상태 업데이트
 
    // 가격 계산
    calculateTotalPrice(sortedCarts);
    calculateDiyPrice(sortedDiyItems);

    // 선택된 아이템의 총 가격 계산
    const totalSelectedPrice = checkItems.reduce((acc, item) => acc + (item.quantity || 0) * (item.price || 0), 0);
    setSelectedPrice(totalSelectedPrice);
   
    // 체크된 아이템 초기화
    setCheckItems([]);

  } catch (error) {
    // 에러가 발생한 경우 콘솔에 출력
    console.error('Failed to delete checked items or fetch updated cart:', error);
  }
};

useEffect(() => {
  console.log('Updated checkItems:', checkItems);
}, [checkItems]);

  
 
  console.log(checkItems);
  console.log(diyItem);
  // console.log(selectedPrice);
 
  return (
    <div className="cart" style={{ height: 'max-content' }}>
      <div className="cart_wrapper">
        <div className="cart_order">
          <p>1. 장바구니</p>
          <p>2. 주문서작성</p>
          <p>3. 주문완료</p>
        </div>
        <div className="cart_content">
          <div className="map_wrapper">
            <div>
              <div
                onClick={() => {
                  openItems();
                  normalItem();
                }}
                className="cart_open"
              >
                장바구니상품
              </div>
              {isNormal ? 
              <>
              <div className="cart_normal">일반상품 ({carts.length + diyItem.length}) 
                      <div className='input_wrapper'><input type="checkbox" className="normal_input" style={{order:"1"}}onClick = {(e) => handleAllCheck(e.target.checked)} 
                checked={checkItems.length === (carts.length + diyItem.length) ? true : false} /></div>
              </div>
              <div className="cart_normal_2_wrapper">
              <div className="cart_normal_2" style={{order:"3"}}><button onClick={deleteAll} className='delete_all_btn'>전체 삭제</button></div>
              <div className="cart_normal_2" style={{order:"2"}}><button onClick={deleteCheckedItems} className='delete_all_btn'>선택 삭제</button></div>
        </div></> : ''
              }
            
            </div>
            <div className="All">
            {/* <button  className="deleteAll_btn">전체 삭제</button> */}
            </div>
            {carts.map((cart, idx) => {
              const uniqueProductKey = `${cart.product_id}_${cart.product_size}`;
              if (isOpen === true)
                return (
                  <div className="cart_products">
                    <input
                      type="checkBox"
                      style={{ marginRight: '20px' }}
                      onChange={(e) =>
                        handleSingleCheck(e.target.checked, cart.product_id, cart.product_size, cart.quantity, cart.selected_options, cart.cart_item_id, cart.details)
                      }
                      checked={checkItems.some(
                        (item) => item.productId === cart.product_id && item.productSize === cart.product_size
                      )}
                    />

                    <Link to={`/product_detail/${cart.product_id}`}>
                      {' '}
                      <div className="cart_left">
                        <img
                          src={cart.product_size === '80g' ? cart.details?.p_main_img : cart.details?.p_main_img_1}
                          alt=""
                        />
                      </div>
                    </Link>
                    <div className="cart_right">
                      <div className="cart_up">
                        <div className="cart_up_txt">
                          <Link
                            to={`/product_detail/${cart.product_id}`}
                            style={{ textDecoration: 'none', color: 'black' }}
                          >
                            <p>
                              상품이름 : {cart.product_size === '80g' ? cart.details?.p_name : cart.details?.p_name_1}
                            </p>
                          </Link>
                          <p>
                            
                            {cart.product_size === '80g'
                              ? new Intl.NumberFormat().format(
                                  parseInt(cart.details?.p_price.replace(/,/g, '')) * parseInt(cart.quantity)
                                )
                              : new Intl.NumberFormat().format(
                                  parseInt(cart.details?.p_price_1.replace(/,/g, '')) * parseInt(cart.quantity)
                                )}
                            원
                          </p>
                          <p>배송 : [무료] / 기본배송</p>
                        </div>
                        <div style={{ width: '100px' }}>
                          <MdClose
                            style={{ cursor: 'pointer', height: '30px', width: '30px', color: '#d3d0d0' }}
                            // onClick={() => {
                            //   noItem(userId, cart.product_id, cart.product_size);
                            // }}
                            onClick={async () => {
                              try {
                                // 서버에 수량 변경 요청을 보내고
                                // await handleCheckChange(cart.product_id, cart.product_size, cart.cart_item_id);
                                await noItem(userId, cart.product_id, cart.product_size);
                            
                                // 서버 응답 후에 `checkItems` 상태 업데이트
                                handleCheckChange(cart.product_id, cart.product_size, cart.cart_item_id);
                              } catch (error) {
                                console.error("Failed to delete items", error);
                              }
                            }}
                          />
                        </div>
                      </div>
                      <div className="cart_down">
                        <div>
                          <button
                            className="quantity_btn"
                            onClick={async () => {
                              try {
                                // 서버에 수량 변경 요청을 보내고
                                await quantityChange(userId, cart.product_id, cart.product_size, cart.quantity - 1);
                            
                                // 서버 응답 후에 `checkItems` 상태 업데이트
                                handleQuantityChange(cart.product_id, cart.product_size, cart.quantity - 1, cart.cart_item_id);
                              } catch (error) {
                                console.error("Failed to update quantity", error);
                              }
                            }}
                          >
                            -
                          </button>
                          <div>{cart.quantity}</div>
                          <button
                            className="quantity_btn"
                            onClick={async () => {
                              try {
                                // 서버에 수량 변경 요청을 보내고
                                await quantityChange(userId, cart.product_id, cart.product_size, cart.quantity + 1);
                            
                                // 서버 응답 후에 `checkItems` 상태 업데이트
                                handleQuantityChange(cart.product_id, cart.product_size, cart.quantity + 1, cart.cart_item_id);
                              } catch (error) {
                                console.error("Failed to update quantity", error);
                              }
                            }}
                          >
                            +
                          </button>
                        </div>
                        <div className="cart_down_btn">
                          {/* <button>관심상품</button> */}
                          <button
                            onClick={() => {
                              navigate('/purchase');
                              handlePurchase(cart);
                            }}
                          >
                            주문하기
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
            })}
           
            {diyItem.map((item,idx)=>{
              if(isOpen === true)
                return(
                <div className="cart_products">
                   <input
      type="checkbox"
      style={{ marginRight: '20px' }}
      onChange={(e) =>
        handleSingleCheck(e.target.checked, item.product_id, null, item.quantity, true, item.cart_item_id, item.details)
      }
      checked={checkItems.some(
        (checkedItem) => checkedItem.cartItemId === item.cart_item_id && checkedItem.isDiy === true
      )}
    />

                <Link to={'/diyItem'}>
                  {' '}
                  <div className="cart_left">
                    <img
                      src={item.details?.p_main_img}
                      alt="p_main_img"
                    />
                  </div>
                </Link>
                <div className="cart_right">
                  <div className="cart_up">
                    <div className="cart_up_txt">
                      <Link
                          to={'/diyItem'} 
                        style={{textDecoration:"none", color:"black"}}
                       > 
                        <p>
                          상품이름 : {item.details?.p_name}
                        </p>
                      </Link>
                     
                      <p style={{color: "#a59b9b", fontSize:"13px" }}>{item.selected_options.join(', ')}</p>
                      <p>
                     {new Intl.NumberFormat().format(
                        parseInt(item.details?.p_price.replace(/,/g, '')) * parseInt(item.quantity)
                    )  }원
                      </p>
                      <p>배송 : [무료] / 기본배송</p>
                    </div>
                    <div style={{ width: '100px' }}>
                      <MdClose
                        style={{ cursor: 'pointer', height: '30px', width: '30px', color: '#d3d0d0' }}
                        // onClick={() => {
                        //   noItem(userId, item.product_id, null, item.cart_item_id);
                        // }}
                        onClick={async () => {
                          try {
                            // 서버에 수량 변경 요청을 보내고
                            // await handleCheckChange(item.product_id, item.product_size, item.cart_item_id);
                            await noItem(userId, item.product_id, null, item.cart_item_id);
                        
                            // 서버 응답 후에 `checkItems` 상태 업데이트
                            handleCheckChange(item.product_id, null, item.cart_item_id);
                          } catch (error) {
                            console.error("Failed to delete items", error);
                          }
                        }}
                      />
                    </div>
                  </div>
                  <div className="cart_down">
                    <div>
                      <button
                        className="quantity_btn"
                        onClick={async () => {
                          try {
                            // 서버에 수량 변경 요청을 보내고
                            await quantityChange(userId, null, null, item.quantity - 1, item.cart_item_id);
                        
                            // 서버 응답 후에 `checkItems` 상태 업데이트
                            handleQuantityChange(item.product_id, item.product_size, item.quantity - 1, item.cart_item_id);
                          } catch (error) {
                            console.error("Failed to update quantity", error);
                          }
                        }}
                      >
                        -
                      </button>
                      <div>{item.quantity}</div>
                      <button
                        className="quantity_btn"
                        onClick={async () => {
                          try {
                            // 서버에 수량 변경 요청을 보내고
                            await  quantityChange(userId, null, null, item.quantity + 1, item.cart_item_id);
                        
                            // 서버 응답 후에 `checkItems` 상태 업데이트
                            handleQuantityChange(item.product_id, item.product_size, item.quantity + 1, item.cart_item_id);
                          } catch (error) {
                            console.error("Failed to update quantity", error);
                          }
                        }}
                      >
                        +
                      </button>
                    </div>
                    <div className="cart_down_btn">
                      {/* <button>관심상품</button> */}
                      <button
                        onClick={() => {
                          navigate('/purchase');
                          handleDiyPurchase(item)
                        }}
                      >
                        주문하기
                      </button>
                    </div>
                  </div>
                  
                </div>
              
              </div>
             
                      )
})}
          </div>
          <div className="cart_purchase">
            <div className="cart_purchase_top">
              <p>주문상품</p>
              <div>
                <p>
                  <span>총 상품금액 </span>
                  <span>
                    {checkItems.length === 0 ? totalPrice : selectedPrice}
                    {/* {totalPrice} */}
                    원</span>{' '}
                </p>
                <p>
                  <span>총 배송비 </span>
                  <span>0원</span>{' '}
                </p>
              </div>
              <p>
                <span>결제예정금액 : </span>
                <span> 
                {checkItems.length === 0 ? totalPrice : selectedPrice}
                  {/* {totalPrice} */}
                  원</span>
              </p>
            </div>
            <div className="cart_purchase_bottom">
              <button onClick={handleOrderAll}>전체상품주문</button>
              <button
                onClick={() => {
                  navigate('/purchase');
                  selectedPurchase();
                }}
              >
                선택상품주문
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
