<?php
/**
 * Business details, editable in Appearance → Customize → "פרטי העסק".
 *
 * @package nachman
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * All theme options with their defaults.
 */
function np_defaults() {
	return array(
		'np_tagline'         => 'עריכת סרטים מקצועית במחיר שלא תאמינו',
		'np_hero_text'       => 'כל סוגי הסרטים עד חצי שעה, בעריכה משולבת AI ובאיכות 4K. שולחים חומרים ומקבלים סרט ערוך ומוכן, בלי חבילות מסובכות ובלי הפתעות במחיר.',
		'np_price_single'    => '20',
		'np_price_pack10'    => '180',
		'np_price_pack20'    => '250',
		'np_autoreply_on'    => false,
		'np_max_minutes'     => '30',
		'np_email'           => 'naftalinahar@gmail.com',
		'np_area'            => '',
		'np_instagram'       => '',
		'np_tiktok'          => '',
		'np_youtube'         => '',
		'np_facebook'        => '',
		'np_about'           => '',
		'np_autoreply'       => "שלום {name},\n\nתודה שפנית לנחמן הפקות! קיבלנו את הבקשה שלך לעריכת סרט.\n\nכדי שנוכל להתחיל, אפשר פשוט להשיב למייל הזה ולצרף את החומרים לסרט:\n• סרטונים ותמונות (לקבצים גדולים: קישור Google Drive או WeTransfer)\n• מוזיקה, אם יש שיר מסוים שרוצים\n• טקסטים, כתוביות או שמות שצריכים להופיע\n• כל הערה על הסגנון שאתם רוצים\n\nהחבילה שבחרת: {price}\n\nנחזור אליך בהקדם,\nנחמן הפקות",
	);
}

/**
 * Get an option value with its default.
 */
function np_opt( $key ) {
	$defaults = np_defaults();
	$value    = get_theme_mod( $key, isset( $defaults[ $key ] ) ? $defaults[ $key ] : '' );
	return is_string( $value ) ? trim( $value ) : $value;
}

/**
 * Register Customizer settings.
 */
function np_customize_register( $wp_customize ) {
	$wp_customize->add_section(
		'np_business',
		array(
			'title'       => 'פרטי העסק – נחמן הפקות',
			'priority'    => 20,
			'description' => 'כאן מעדכנים מחירים, מייל, רשתות חברתיות. שדה ריק פשוט לא יוצג באתר.',
		)
	);

	$fields = array(
		'np_tagline'         => array( 'כותרת ראשית', 'text', 'sanitize_text_field' ),
		'np_hero_text'       => array( 'טקסט פתיחה', 'textarea', 'sanitize_textarea_field' ),
		'np_price_single'    => array( 'מחיר לסרטון בודד (₪)', 'number', 'np_sanitize_number' ),
		'np_price_pack10'    => array( 'מחיר חבילת 10 סרטונים (₪)', 'number', 'np_sanitize_number' ),
		'np_price_pack20'    => array( 'מחיר חבילת 20 סרטונים (₪)', 'number', 'np_sanitize_number' ),
		'np_max_minutes'     => array( 'אורך מקסימלי לסרטון (דקות)', 'number', 'absint' ),
		'np_email'           => array( 'אימייל (גם לקבלת פניות מהטופס)', 'email', 'sanitize_email' ),
		'np_area'            => array( 'אזור שירות / הערה', 'text', 'sanitize_text_field' ),
		'np_instagram'       => array( 'קישור לאינסטגרם', 'url', 'esc_url_raw' ),
		'np_tiktok'          => array( 'קישור לטיקטוק', 'url', 'esc_url_raw' ),
		'np_youtube'         => array( 'קישור לערוץ יוטיוב', 'url', 'esc_url_raw' ),
		'np_facebook'        => array( 'קישור לפייסבוק', 'url', 'esc_url_raw' ),
		'np_about'           => array( 'קצת על נחמן (אופציונלי)', 'textarea', 'sanitize_textarea_field' ),
		'np_autoreply_on'    => array( 'לשלוח ללקוח מייל תשובה אוטומטי', 'checkbox', 'wp_validate_boolean' ),
		'np_autoreply'       => array( 'נוסח המייל האוטומטי. אפשר להשתמש ב-{name} (שם הלקוח) וב-{price} (החבילה והמחיר)', 'textarea', 'sanitize_textarea_field' ),
	);

	$defaults = np_defaults();
	foreach ( $fields as $key => $f ) {
		$wp_customize->add_setting(
			$key,
			array(
				'default'           => $defaults[ $key ],
				'sanitize_callback' => $f[2],
			)
		);
		$wp_customize->add_control(
			$key,
			array(
				'label'   => $f[0],
				'section' => 'np_business',
				'type'    => $f[1],
			)
		);
	}
}
add_action( 'customize_register', 'np_customize_register' );

/**
 * Price packages: key => [label, number of videos, total price].
 */
function np_packages() {
	return array(
		'single' => array( 'סרטון בודד', 1, (float) np_opt( 'np_price_single' ) ),
		'pack10' => array( 'חבילת 10 סרטונים', 10, (float) np_opt( 'np_price_pack10' ) ),
		'pack20' => array( 'חבילת 20 סרטונים', 20, (float) np_opt( 'np_price_pack20' ) ),
	);
}

/**
 * Sanitize a non-negative decimal number.
 */
function np_sanitize_number( $value ) {
	$value = (float) str_replace( ',', '.', (string) $value );
	return (string) max( 0, $value );
}

/**
 * Sanitize a list of URLs, one per line.
 */
function np_sanitize_lines( $value ) {
	$lines = preg_split( '/\r\n|\r|\n/', (string) $value );
	$clean = array();
	foreach ( $lines as $line ) {
		$line = esc_url_raw( trim( $line ) );
		if ( $line ) {
			$clean[] = $line;
		}
	}
	return implode( "\n", $clean );
}
