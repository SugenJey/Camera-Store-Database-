
async function getProducts(key) {
    const response = await fetch("/equipment/" + key);
    const products = await response.json();

    var cards = '';
    
    for (let index = 0; index < products.length; index++) {
        const productEntry = products[index]

        var brand = productEntry['BRAND'];
        var title;
        var description;
        var category;
        var detailsList;

        var type = '';
        var complete = false;


        if(productEntry['MEGAPIXEL'] !== undefined && productEntry['MEGAPIXEL'] !== null){
            type='camera';
            title = productEntry['DESCRIPTION'];
            description = productEntry['NAME'];
            category = 'Camera';
            detailsList = `
            <ul>
                <li>Megapixels: ${productEntry['MEGAPIXEL']}</li>
                <li>Resolution: ${productEntry['RESOLUTION']}</li>
                <li>Lens Type: ${productEntry['LENSTYPE']}</li>
                <li>Aperature: ${productEntry['APERTURE']}</li>
            <ul>`;
            complete = true;
        }
        else if(productEntry['ACCESSORYTYPE'] !== undefined && productEntry['ACCESSORYTYPE'] !== null){
            type='accessory';
            title = productEntry['NAME'];
            description = productEntry['DESCRIPTION'];
            category = productEntry['ACCESSORYTYPE'];
            detailsList = `
            <ul>
                <li>Colour: ${productEntry['COLOR']}</li>
                <li>Weight: ${productEntry['WEIGHT']}g</li>
            <ul>`; 
            complete = true;
        }

        var card = `<div class='card-padding col-sm-4 equipment'>
                        <div class='neu-card product-header' data-id='${productEntry['EQUIPMENTID']}' data-type='${type}' style="height: 99%;">
                            <h3 class='text-center product-title'>${brand} - ${title}</h3>
                            <div class="p-4">
                                <h5>${description} - ${category}</h5>
                                <hr>
                                ${detailsList}
                            </div>
                            <br>
                            <div class="row">
                                <div class='p-4 col-sm-6'>
                                    <button class='btn btn-danger btn-sm btn-delete-product'>Delete Product</button>
                                </div>
                                <div class='p-4 col-sm-6'>
                                    <button class='btn btn-light btn-sm btn-buy-product ml-4'>Add to Inventory</button>
                                </div>
                            </div>
                        </div>
                    </div>`
        if(complete) cards += card;
    }

    $('#data-container').empty().append(cards);

    $('.btn-delete-product').off('click.main').on('click.main', function(){
        var deleteModal = new bootstrap.Modal(document.getElementById('modal-delete'))

        const $product = $(this).closest('.product-header');
        const product_title = $product.find('.product-title').text();
        const product_id = $product.data('id');
        const product_type = $product.data('type');

        $('#modal-delete-name').text(product_title);
        $('#modal-delete-ID').val(product_id);
        $('#modal-delete-table').val(product_type);

        deleteModal.show();
        //$('#modal-delete-show').trigger('click');
    });

    $('.btn-buy-product').off('click.main').on('click.main', function(){
        const $product = $(this).closest('.product-header');
        const product_id = $product.data('id');
        const today = new Date()
        
        const data = {
            'RentalCost': 24, 
            'AcquisitionDate': today.toISOString().split('T')[0],
            'Condition': 'Excellent', 
            'Availability': 1, 
            'EquipmentID': product_id
        }

        buyProduct(data);
    });
}

async function getInventory() {
    const response = await fetch("/equipment/inventory");
    const products = await response.json();

    var cards = '';
    
    for (let index = 0; index < products.length; index++) {
        const productEntry = products[index]

        var img = '';//'https://www.sony.ca/image/c8a930c97af5746b7120d4b639cfe813?fmt=pjpeg&wid=165&bgcolor=FFFFFF&bgc=FFFFFF';
        var imgAlt = '';

        var brand = productEntry['BRAND'];
        var title;
        var description;
        var detailsList;

        var type = '';
        var complete = false;

        console.log(productEntry);

        if(productEntry['ItemID'] !== null){
            title = productEntry['NAME'];
            description = productEntry['DESCRIPTION'];
            detailsList = `
            <ul>
                <li>Condition: ${productEntry['CONDITION']}</li>
                <li>Rental Cost: $${productEntry['RENTALCOST']} / week</li>
                <li>Available Today: ${productEntry['AVAILABILITY'] == 1 ? 'Yes' : 'No'}</li>
                <li>Purchased On: ${productEntry['ACQUISITIONDATE'].slice(0,10)}</li>
            <ul>`;
            complete = true;
        }

        var card = `<div class='card-padding col-sm-4'>
                        <div class='neu-card product-header' data-id='${productEntry['ItemID']}' data-type='${type}' style="height: 99%;">
                            <h3 class='text-center product-title'>${brand} - ${title}</h3>
                            <div class="p-2 pb-0" style="height: 200px;">
                                <img src='${img}' alt='${imgAlt}' height="100%">
                            </div>
                            <div class="p-4">
                                <h5>${description}</h5>
                                <hr>
                                ${detailsList}
                            </div>
                            <br>
                            <div class="row" hidden>
                                <div class='p-4 col-sm-6'>
                                    <button class='btn btn-danger btn-sm btn-delete-product'>Delete Product</button>
                                </div>
                                <div class='p-4 col-sm-6'>
                                    <button class='btn btn-light btn-sm btn-buy-product ml-4'>Add to Inventory</button>
                                </div>
                            </div>
                        </div>
                    </div>`
        if(complete) cards += card;
    }

    $('#data-container').empty().append(cards);

    $('.btn-delete-product').off('click.main').on('click.main', function(){
        const $product = $(this).closest('.product-header');
        const product_title = $product.find('.product-title').text();
        const product_id = $product.data('id');
        const product_type = $product.data('type');

        $('#modal-delete-name').text(product_title);
        $('#modal-delete-ID').val(product_id);
        $('#modal-delete-table').val(product_type);

        deleteModal.hide();
        //$('#modal-delete-show').trigger('click');
    });

    $('.btn-buy-product').off('click.main').on('click.main', function(){
        const $product = $(this).closest('.product-header');
        const product_id = $product.data('id');
        const today = new Date()
        
        const data = {
            'RentalCost': 24, 
            'AcquisitionDate': today.toISOString().split('T')[0],
            'Condition': 'Excellent', 
            'Availability': 1, 
            'EquipmentID': product_id
        }

        buyProduct(data);
    });
}

async function createProduct(type){
    try {
        if(type == 'camera'){
            const dataEquip = {
                'Brand': $('#modal-create-camera').find('.create-Brand').val(),
                'Description': $('#modal-create-camera').find('.create-Description').val(),
                'Name': $('#modal-create-camera').find('.create-Name').val(),
            };

            const productResponse = await postData('/create/equipment', "POST", dataEquip);
            if(productResponse.status === 200) showToast('success','Product entry created.');
            else showToast('error','Unable to create Product.');

            const data = {
                'MegaPixel': $('#modal-create-camera').find('.create-MegaPixel').val(),
                'Resolution': $('#modal-create-camera').find('.create-Resolution').val(),
                'LensType': $('#modal-create-camera').find('.create-LensType').val(),
                'Aperture': $('#modal-create-camera').find('.create-Aperture').val(),
            };

            const response = await postData('/create/' + type, "POST", data);
            if(response.status === 200) showToast('success','Camera entry created.');
            else showToast('error','Unable to create Camera.');
        }
        else if(type == 'accessory'){
            const dataEquip = {
                'Brand': $('#modal-create-accessory').find('.create-Brand').val(),
                'Description': $('#modal-create-accessory').find('.create-Description').val(),
                'Name': $('#modal-create-accessory').find('.create-Name').val(),
            };

            const productResponse = await postData('/create/equipment', "POST", dataEquip);
            if(productResponse.status === 200) showToast('success','Product entry created.');
            else showToast('error','Unable to create Product.');

            const data = {
                'Weight': $('#modal-create-accessory').find('.create-Weight').val(),
                'Color': $('#modal-create-accessory').find('.create-Color').val(),
                'AccessoryType': $('#modal-create-accessory').find('.create-AccessoryType').val()
            };
            const response = await await postData('/create/' + type, "POST", data);
            if(response.status === 200) showToast('success','Accessory entry created.');
            else showToast('error','Unable to create Accessory.');
        }
        else return;
    } catch (error) {
        showToast('error','Unable to create product.');
        console.log(error);
    }
}

async function sendUtility(action){
    try {
        const response = await postData('/' + action, "POST");
        if(response.rowsAffected == 1) showToast('success','All tables ' + action + 'ed.');
        else showToast('error','Unable to ' + action + ' all tables.');
    } catch (error) {
        showToast('error','Unable to ' + action + ' all tables.');
        console.log(error);
    }
}

function deleteProduct(){    
    const table = $('#modal-delete-table').val();

    const settings = {
        async: true,
        crossDomain: true,
        url: '/delete/' + table,
        data: {
            'id': $('#modal-delete-ID').val()
        },
        method: 'POST'
    };

    
    $.ajax(settings).done(function (response) {
        try {
            if(response.rowsAffected == 1){
                showToast('success','Product deleted.');
                $('#modal-create-camera-close').trigger('click');
                $('#btn-get-cameras').trigger('click.main');
            }
            else showToast('error','Unable to delete.');
        } catch (error) {
            showToast('error','Unable to delete.');
            console.log(String(error));
        }
    });
}

async function buyProduct(data){
    try {
        const response = await postData('/create/inventory', "POST", data);
        if(response.status === 200) showToast('success','Product added to Inventory.');
        else showToast('error','Unable to add product to Inventory.');

    } catch (error) {
        showToast('error','Unable to delete product.');
        console.log(String(error));
    }
}

async function postData(url = "", method = "POST", data = {}) {

    console.log('sending body ' + JSON.stringify(data));

    const response = await fetch(url, {
        method: method, // *GET, POST, PUT, DELETE, etc.
        headers: {
            "Content-Type": "application/json",
            // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: JSON.stringify(data), // body data type must match "Content-Type" header
    });

    try{
        return response.json(); // parses JSON response into native JavaScript objects
    }catch(error){
        return response;
    }
}

function showToast(status, message){
    //Command: toastr["success"]("My name is Inigo Montoya. You killed my father. Prepare to die!")

    toastr.options = {
        "closeButton": false,
        "debug": false,
        "newestOnTop": false,
        "progressBar": true,
        "positionClass": "toast-bottom-left",
        "preventDuplicates": false,
        "onclick": null,
        "showDuration": "300",
        "hideDuration": "1000",
        "timeOut": "5000",
        "extendedTimeOut": "1000",
        "showEasing": "swing",
        "hideEasing": "linear",
        "showMethod": "fadeIn",
        "hideMethod": "fadeOut"
    }

    switch (status) {
        case 'success':
            toastr.success(message);
            break;
        case 'error':
            toastr.error(message);
            break;
        case 'info':
            toastr.info(message);
            break;
        default:
            toastr.warning('Invalid toastr request.')
            break;
    }
}

$(document).ready(function(){

    $('.controls').hide();

    $(".nav-link").off('click.nav').on('click.nav', function(){
        var newKey = $(this).data('key');
        var oldKey = $('.nav-link.active').data('key');

        $('.' + oldKey).hide();
        $('#controls-' + oldKey).hide();
        $('.' + newKey).show();
        $('#controls-' + newKey).show();

        $('.nav-link.active').removeClass('active');
        $(this).addClass('active');
        $('#controls-' + newKey).find('.btn-main').trigger('click.main');
    });
    
    $('.btn-utility').off('click.main').on('click.main', function(){
        var key = $(this).val();

        sendUtility(key);
    });

    $(".btn-get-products").off('click.main').on('click.main', function() {
        var key = $(this).val();
        console.log(key);
        $('#disp-showing-equipment').val(key).text('Showing: ' + $(this).text());
        getProducts(key);
    });

    $('#btn-get-inventory').off('click.main').on('click.main', function() {
        getInventory();
    });

    $("#modal-create-camera-submit").off('click.main').on('click.main', function() {
        createProduct('camera');
    });

    $("#modal-create-accessory-submit").off('click.main').on('click.main', function() {
        createProduct('accessory');
    });

    $("#modal-delete-submit").off('click.main').on('click.main', function() {
        deleteProduct();
    });

    $(".nav-link").first().trigger('click.nav');
})