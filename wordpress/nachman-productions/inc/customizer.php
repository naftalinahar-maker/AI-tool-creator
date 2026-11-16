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
		'np_price_per_block' => '5',
		'np_block_minutes'   => '10',
		'np_max_minutes'     => '30',
		'np_phone'           => '',
		'np_whatsapp'        => '',
		'np_email'           => '',
		'np_area'            => '',
		'np_instagram'       => '',
		'np_tiktok'          => '',
		'np_youtube'         => '',
		'np_facebook'        => '',
		'np_videos'          => '',
		'np_about'           => '',
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
			'description' => 'כאן מעדכנים מחירים, פרטי קשר, רשתות חברתיות וסרטונים לתיק העבודות. שדה ריק פשוט לא יוצג באתר.',
		)
	);

	$fields = array(
		'np_tagline'         => array( 'כותרת ראשית', 'text', 'sanitize_text_field' ),
		'np_hero_text'       => array( 'טקסט פתיחה', 'textarea', 'sanitize_textarea_field' ),
		'np_price_per_block' => array( 'מחיר (₪) לכל יחידת זמן', 'number', 'np_sanitize_number' ),
		'np_block_minutes'   => array( 'יחידת זמן (דקות)', 'number', 'absint' ),
		'np_max_minutes'     => array( 'אורך סרט מקסימלי (דקות)', 'number', 'absint' ),
		'np_phone'           => array( 'טלפון', 'text', 'sanitize_text_field' ),
		'np_whatsapp'        => array( 'מספר וואטסאפ (למשל 0501234567)', 'text', 'sanitize_text_field' ),
		'np_email'           => array( 'אימייל (גם לקבלת פניות מהטופס)', 'email', 'sanitize_email' ),
		'np_area'            => array( 'אזור שירות / הערה', 'text', 'sanitize_text_field' ),
		'np_instagram'       => array( 'קישור לאינסטגרם', 'url', 'esc_url_raw' ),
		'np_tiktok'          => array( 'קישור לטיקטוק', 'url', 'esc_url_raw' ),
		'np_youtube'         => array( 'קישור לערוץ יוטיוב', 'url', 'esc_url_raw' ),
		'np_facebook'        => array( 'קישור לפייסבוק', 'url', 'esc_url_raw' ),
		'np_videos'          => array( 'תיק עבודות – קישורי יוטיוב/וימאו, קישור בכל שורה', 'textarea', 'np_sanitize_lines' ),
		'np_about'           => array( 'קצת על נחמן (אופציונלי)', 'textarea', 'sanitize_textarea_field' ),
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
