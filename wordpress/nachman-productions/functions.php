<?php
/**
 * Nachman Productions theme setup.
 *
 * @package nachman
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'NP_VERSION', '1.0.0' );

require_once get_template_directory() . '/inc/customizer.php';
require_once get_template_directory() . '/inc/contact-form.php';

/**
 * Theme supports and menus.
 */
function np_setup() {
	add_theme_support( 'title-tag' );
	add_theme_support( 'post-thumbnails' );
	add_theme_support( 'custom-logo', array( 'height' => 120, 'width' => 360, 'flex-width' => true, 'flex-height' => true ) );
	add_theme_support( 'html5', array( 'search-form', 'comment-form', 'gallery', 'caption', 'style', 'script' ) );
	add_theme_support( 'responsive-embeds' );
	add_theme_support( 'align-wide' );

	register_nav_menus(
		array(
			'primary' => 'תפריט ראשי',
		)
	);
}
add_action( 'after_setup_theme', 'np_setup' );

/**
 * Styles and scripts.
 */
function np_assets() {
	wp_enqueue_style( 'np-fonts', 'https://fonts.googleapis.com/css2?family=Heebo:wght@400;500;700;900&family=Secular+One&display=swap', array(), null );
	wp_enqueue_style( 'np-main', get_template_directory_uri() . '/assets/css/main.css', array( 'np-fonts' ), NP_VERSION );
	wp_enqueue_script( 'np-main', get_template_directory_uri() . '/assets/js/main.js', array(), NP_VERSION, true );
}
add_action( 'wp_enqueue_scripts', 'np_assets' );

/**
 * Preconnect for Google Fonts.
 */
function np_resource_hints( $urls, $relation ) {
	if ( 'preconnect' === $relation ) {
		$urls[] = 'https://fonts.googleapis.com';
		$urls[] = array( 'href' => 'https://fonts.gstatic.com', 'crossorigin' );
	}
	return $urls;
}
add_filter( 'wp_resource_hints', 'np_resource_hints', 10, 2 );

/**
 * Theme image URL helper.
 */
function np_img( $file ) {
	return esc_url( get_template_directory_uri() . '/assets/img/' . $file );
}

/**
 * Format a price for display: 1 → "₪1", 1.5 → "₪1.50".
 */
function np_money( $amount ) {
	$amount = (float) $amount;
	return '₪' . ( floor( $amount ) == $amount ? number_format_i18n( $amount ) : number_format_i18n( $amount, 2 ) );
}

/**
 * Price as HTML for big displays: number + smaller, lighter ₪ sign.
 */
function np_money_html( $amount ) {
	$amount = (float) $amount;
	$num    = floor( $amount ) == $amount ? number_format_i18n( $amount ) : number_format_i18n( $amount, 2 );
	return '<span class="num">' . esc_html( $num ) . '</span><span class="cur">₪</span>';
}

/**
 * Fallback menu when no menu is assigned: anchors to the home page sections.
 */
function np_fallback_menu() {
	$home  = home_url( '/' );
	$items = array(
		'#services' => 'שירותים',
		'#pricing'  => 'מחירים',
		'#process'  => 'איך זה עובד',
		'#faq'      => 'שאלות נפוצות',
		'#contact'  => 'צור קשר',
	);
	echo '<ul class="nav__list">';
	foreach ( $items as $hash => $label ) {
		printf( '<li><a href="%s">%s</a></li>', esc_url( $home . $hash ), esc_html( $label ) );
	}
	echo '</ul>';
}

/**
 * Hide the admin bar margin jump on the front page hero.
 */
function np_body_classes( $classes ) {
	if ( is_front_page() ) {
		$classes[] = 'is-home';
	}
	return $classes;
}
add_filter( 'body_class', 'np_body_classes' );

/**
 * Default browser-tab icon (the dragon from the logo).
 * If an icon is set in Customize → Site Identity → Site Icon, WordPress uses that instead.
 */
function np_favicon() {
	if ( has_site_icon() ) {
		return;
	}
	printf( '<link rel="icon" href="%s" sizes="any">' . "\n", np_img( 'favicon.ico' ) );
	printf( '<link rel="icon" type="image/png" sizes="32x32" href="%s">' . "\n", np_img( 'favicon-32.png' ) );
	printf( '<link rel="apple-touch-icon" href="%s">' . "\n", np_img( 'apple-touch-icon.png' ) );
}
add_action( 'wp_head', 'np_favicon', 2 );
add_action( 'admin_head', 'np_favicon', 2 );
add_action( 'login_head', 'np_favicon', 2 );
